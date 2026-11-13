import app from "../server/index.js";

export default function handler(req, res) {
  const requestUrl = new URL(req.url || "/", "http://localhost");
  const apiPath = requestUrl.searchParams.get("__api_path");
  if (!apiPath) {
    return res.status(400).json({ message: "Rute API tidak ditemukan." });
  }

  requestUrl.searchParams.delete("__api_path");
  req.url = `/api/${apiPath}${requestUrl.search}`;
  return app(req, res);
}
