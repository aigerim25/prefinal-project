import { createAsyncThunk } from "@reduxjs/toolkit";
import { createPlaylist, updatePlaylist, deletePlaylist } from "../../services/service.js";
import { isNetworkError } from "../../services/withRetry.js";

function toRejectValue(error) {
  return { message: error.message, isNetworkError: isNetworkError(error) };
}

function cleanAlbum(album) {
  const { fromCache, ...rest } = album;
  return rest;
}

export const createAlbum = createAsyncThunk(
  "albums/create",
  async (data, { rejectWithValue }) => {
    try {
      return cleanAlbum(await createPlaylist(data));
    } catch (error) {
      return rejectWithValue(toRejectValue(error));
    }
  },
);

export const updateAlbum = createAsyncThunk(
  "albums/update",
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      return cleanAlbum(await updatePlaylist(id, changes));
    } catch (error) {
      return rejectWithValue(toRejectValue(error));
    }
  },
);

export const deleteAlbum = createAsyncThunk(
  "albums/delete",
  async (id, { rejectWithValue }) => {
    try {
      const result = await deletePlaylist(id);
      return { id: Number(result.id) };
    } catch (error) {
      return rejectWithValue(toRejectValue(error));
    }
  },
);
