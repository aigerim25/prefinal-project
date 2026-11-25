import { useDispatch, useSelector } from "react-redux";
import { selectShowingCachedData } from "../features/albums/albumsSelectors.js";
import { dataInvalidated } from "../app/actions.js";
function CachedDataNotice() {
  const dispatch = useDispatch();
  const showingCached = useSelector(selectShowingCachedData);

  if (!showingCached) return null;

  function refresh() {
    dispatch(dataInvalidated());
  }

  return (
    <div className="cached-notice" role="status">
      <span>You are viewing saved data. It may be out of date.</span>
      <button type="button" className="cached-notice__btn" onClick={refresh}>
        Refresh
      </button>
    </div>
  );
}

export default CachedDataNotice;
