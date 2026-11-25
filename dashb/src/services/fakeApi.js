import { API_CONFIG, DATA_KEY } from "./settings.js";
const API_BASE = "/api";
const CHANGES_KEY = `${DATA_KEY}-local-changes`;

function fakeRequest(operation, options = {}) {
  const {
    minDelay = API_CONFIG.minDelay,
    maxDelay = API_CONFIG.maxDelay,
    errorChance = API_CONFIG.errorChance,
  } = options;

  return new Promise((resolve, reject) => {
    const delayMS =
      Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    setTimeout(async () => {
      if (Math.random() < errorChance) {
        reject(new Error("Simulated server Error"));
        return;
      }

      try {
        resolve(await operation());
      } catch (error) {
        reject(error);
      }
    }, delayMS);
  });
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`);

  const isJson = (response.headers.get("content-type") || "").includes("json");
  if (response.status === 404 || (response.ok && !isJson)) {
    throw new Error("Item not found");
  }
  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return {
    data: await response.json(),
    fromCache: response.headers.get("X-From-SW-Cache") === "1",
  };
}


function readChanges() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHANGES_KEY) || "{}");
    return { created: [], updated: {}, deleted: [], ...saved };
  } catch {
    return { created: [], updated: {}, deleted: [] };
  }
}

function writeChanges(changes) {
  localStorage.setItem(CHANGES_KEY, JSON.stringify(changes));
}

function applyChanges(item, changes) {
  if (changes.deleted.includes(item.id)) return null;
  return { ...item, ...(changes.updated[item.id] ?? {}) };
}

async function loadAllItems() {
  const { data, fromCache } = await fetchJson("/albums.json");
  const changes = readChanges();

  const items = [...data, ...changes.created]
    .map((item) => applyChanges(item, changes))
    .filter(Boolean);

  return { items, fromCache };
}

async function loadOneItem(id) {
  const numericId = Number(id);
  const changes = readChanges();

  const created = changes.created.find((item) => item.id === numericId);
  if (created) {
    return { item: applyChanges(created, changes), fromCache: false, isLocal: true };
  }

  const { data, fromCache } = await fetchJson(`/albums/${numericId}.json`);
  const item = applyChanges(data, changes);
  if (!item) throw new Error("Item not found");

  return { item, fromCache, isLocal: false };
}


export async function getItemsList(query = "") {
  return fakeRequest(async () => {
    const params = new URLSearchParams(query);
    const search = params.get("search");
    const sort = params.get("sort") || "name";
    const page = Number(params.get("page")) || 1;
    const limit = Number(params.get("limit")) || 10;

    let { items, fromCache } = await loadAllItems();
    if (search) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.artists.toLowerCase().includes(search.toLowerCase()),
      );
    }
    const genre = params.get("genre");
    const decade = Number(params.get("decade"));

    if (genre) {
      items = items.filter((item) => item.genre === genre);
    }

    if (decade) {
      items = items.filter(
        (item) => item.year >= decade && item.year < decade + 10,
      );
    }

    items = [...items].sort((a, b) => {
      switch (sort) {
        case "year":
          return a.year - b.year;
        case "year-desc":
          return b.year - a.year;
        case "song-desc":
          return b.songs.length - a.songs.length;
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "name":
        default:
          return a.title.localeCompare(b.title);
      }
    });

    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      fromCache, 
    };
  });
}

export async function getItem(id) {
  return fakeRequest(async () => {
    const { item, fromCache } = await loadOneItem(id);
    return { ...item, fromCache };
  });
}

export async function createItem(data) {
  return fakeRequest(async () => {
    const { items } = await loadAllItems();
    const changes = readChanges();

    const nextId =
      items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;

    const newItem = {
      ...data,
      id: nextId,
      songs: data.songs ?? [],
    };

    changes.created.push(newItem);
    writeChanges(changes);

    return newItem;
  });
}

export async function updateItem(id, changesToApply) {
  return fakeRequest(async () => {
    const numericId = Number(id);
    const { item, isLocal } = await loadOneItem(numericId); 
    const changes = readChanges();

    const { fromCache, ...clean } = changesToApply;

    if (isLocal) {
      changes.created = changes.created.map((created) =>
        created.id === numericId ? { ...created, ...clean, id: numericId } : created,
      );
    } else {
      changes.updated[numericId] = { ...changes.updated[numericId], ...clean };
    }
    writeChanges(changes);

    return { ...item, ...clean, id: numericId };
  });
}

export async function deleteItem(id) {
  return fakeRequest(async () => {
    const numericId = Number(id);
    const { isLocal } = await loadOneItem(numericId);
    const changes = readChanges();

    if (isLocal) {
      changes.created = changes.created.filter((item) => item.id !== numericId);
    } else {
      changes.deleted.push(numericId);
      delete changes.updated[numericId];
    }
    writeChanges(changes);

    return {
      success: true,
      id: numericId,
    };
  });
}
