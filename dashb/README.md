# Web Music App: Redux Toolkit

This app is a React + Vite music PWA (React Router, Firebase Auth, vite-plugin-pwa).
Server data (albums) and personal data (liked songs) are managed with **Redux Toolkit**.
Authentication stays in `AuthContext`. Temporary UI state stays local in components.

## Project structure

```
src/
  app/
    store.js              configureStore: reducers + middleware
    actions.js            shared action: dataInvalidated
    offlineListener.js    goes to /offline when there is no network and no data
  features/
    albums/               albumsSlice, albumsThunks, albumsMutations, albumsSelectors
    albumDetails/         albumDetailsSlice, albumDetailsThunks, albumDetailsSelectors
    favorites/            favoritesSlice, favoritesSelectors, favoritesListener, favoritesStorage
  services/               API layer: fakeApi.js, service.js, withRetry.js
  hooks/                  usePlaylists, usePlaylist, usePlaylistMutations,
                          useThunkMutation, useFavorites
  pages/, components/     UI only: they call hooks and never touch the API directly
```

Data flow: **UI → custom hook → dispatch(thunk) → service (API) → extraReducers → store → selector → UI**.

## Store

`src/app/store.js` creates the store with `configureStore`, and `main.jsx` wraps the app in `<Provider store={store}>`.

```js
reducer: {
  albums: albumsReducer,
  albumDetails: albumDetailsReducer,
  favorites: favoritesReducer,
}
```

Two listener middlewares are added: `favoritesListener` saves liked songs to localStorage, and `offlineListener` handles offline errors.
When the browser fires the `online` event, the store dispatches `dataInvalidated` so the data on screen is refreshed.

## Slices

| Slice | What it stores | Why it is separate |
|---|---|---|
| `albums` | `byId` (every album, stored once) and `lists` (one entry per query string such as `page=1&sort=name`, with `ids`, `total`, `totalPages`, `status`, `error`, `requestId`, `fetchedAt`, `stale`) | Catalog data and paginated, filtered lists |
| `albumDetails` | Loading state for each album page: `status`, `error`, `notFound`, `fromCache`, `requestId`, `fetchedAt` | Status of the details request. The album data itself is **not** copied here: it lives in `albums.byId` |
| `favorites` | `uid` (whose favorites are loaded) and `items` (liked songs) | Personal feature, persisted in localStorage per user |

**No duplicated state.** An album object exists in exactly one place (`albums.byId`). Lists keep only ids, and `albumDetails` keeps only request status.

**What is NOT in Redux:**
- The user and login/logout stay in `AuthContext`. Redux stores only the `uid` for favorites.
- Search, filters, sort and page live in the URL (`useSearchParams` in `Albums.jsx`, with debounce).
- `isPending` and `error` of a form or button stay in local `useState` (`useThunkMutation`).
- The audio player stays in `PlayerProvider`, because it is tied to one `<audio>` element.

### Reducers and extraReducers

- `reducers` handle synchronous actions, for example `songLiked` (with a `prepare` callback that adds `likedAt`), `songUnliked`, `favoritesLoaded` and `listsInvalidated`.
- `extraReducers` handle `pending`, `fulfilled` and `rejected` of every thunk:
  - `pending`: `status = "loading"`, save `requestId`, keep the old data on screen;
  - `fulfilled`: write the data, set `status = "succeeded"` and `fetchedAt`, clear `stale`;
  - `rejected`: set `status = "failed"` and an error message (and `notFound` for album pages).
- One action can update several slices. For example, `deleteAlbum.fulfilled` removes the album from `albums.byId`, removes its id from every list and deletes its `albumDetails` entry.

## Thunks (createAsyncThunk)

| Thunk | Type | What it does |
|---|---|---|
| `fetchAlbums({ query, force })` | list fetching | Loads a page of albums for a query (search, filter, sort, pagination) |
| `fetchAlbumById({ id, force })` | details fetching | Loads one album |
| `createAlbum(data)`, `updateAlbum({ id, changes })`, `deleteAlbum(id)` | mutations | CRUD on albums |

All thunks call the **service layer** (`services/service.js` → `fakeApi.js`), never `fetch` directly.
Errors are returned with `rejectWithValue({ message, isNetworkError, notFound })`, so the store contains only plain, serializable objects.

### Avoiding unnecessary requests: `condition`

`condition` runs before a thunk starts. If it returns `false`, no request is sent.
- A list that is already loading is not requested again.
- A list loaded less than 60 seconds ago and not marked `stale` is taken from the store.
- An album that is already in `albums.byId` (for example, loaded with the list) opens instantly with no request.
- `force: true` skips the check. It is used by the "Retry" button.

### Stale requests: `requestId`

In `pending` the slice stores `action.meta.requestId`. In `fulfilled` and `rejected` a response whose `requestId` does not match is ignored, so an old, slow response can never overwrite newer data.
`fetchAlbumById` also checks this inside the thunk and rejects an outdated response with `isStale`.
When a mutation happens while a request is in flight, that request's `requestId` is cleared, so its pre-mutation response is ignored and the data is fetched again.

### Retries

`withRetry` repeats a failed **read** request up to 2 times with a growing delay. It does not retry "Item not found" or network errors.
Mutations are not retried automatically, because a repeated `create` could create a duplicate.
The user can always retry with `refetch`.

### Refreshing data after mutations

- The server's response goes straight into `albums.byId`, so the album page updates without another request.
- All lists are marked `stale`. The list currently on screen refetches automatically (`usePlaylists` watches `stale`); other lists refetch when they are opened.
- After a delete, the id is removed from all lists immediately.

## Selectors

Simple selectors (read part of the state):
- `selectAlbumById(state, id)`, `selectListByQuery(state, query)`, `selectAlbumsById`, `selectShowingCachedData`
- `selectLikedSongs`, `selectFavoritesUid`, `selectIsSongLiked(state, songId)`
- `selectAlbumDetailsStatus(state, id)`

Memoized selectors (`createSelector`):
- **`selectAlbumsByQuery(state, query)`** turns a list's `ids` into album objects from `byId`. Without memoization, `.map()` would create a new array on every store update and re-render the component. With `createSelector`, the same array is returned until `ids` or `byId` change.
- **`selectLikedSongIds`** builds a `Set` of liked song ids, which makes `isLiked(id)` an O(1) lookup. The `Set` is rebuilt only when the favorites list changes. It is used in `useFavorites` and `Dashboard`.

## Custom hooks (React ↔ Redux)

Components use `useSelector` and `useDispatch` through hooks, so pages stay simple:
- `usePlaylists(query)` returns `{ albums, total, totalPages, loading, error, fetching, refetch }`. It keeps the previous page on screen while the next one loads.
- `usePlaylist(id)` returns `{ album, loading, error, notFound, fromCache, refetch }`.
- `useCreatePlaylist`, `useUpdatePlaylist`, `useDeletePlaylist` return `{ mutate, mutateAsync, isPending, error, ... }` (built on `useThunkMutation` and `.unwrap()`).
- `useFavorites()` returns `{ likedSongs, isLiked, addToLikedSongs, removeFromLikedSongs, toggleLiked }`. A guest is redirected to `/login`.

## Loading, errors, empty results

Every request has `status: idle | loading | succeeded | failed`. Pages show "Loading...", an error message with retry, "No albums found" for empty results, and "Album not found" for a wrong id.

## PWA and offline

- The service worker and its caching are unchanged. `fakeApi` marks responses served from the SW cache with `fromCache`.
- `showingCachedData` in the store drives the "You are viewing saved data" banner. Its Refresh button dispatches `dataInvalidated`.
- `offlineListener` (listener middleware) watches `rejected` actions. If a request failed because of the network **and** there is no data to show, the app navigates to `/offline`.
- When the network returns, `dataInvalidated` refreshes the visible data.
- Liked songs are stored in localStorage per user, so they work offline.

## Run

```bash
npm install
npm run dev        # development
npm run build      # production build
npm run preview    # check the build and service worker locally
firebase deploy --only hosting
```
