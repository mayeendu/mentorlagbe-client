import "server-only";
import { readClientEnvironment } from "../../config/environment.mjs";

export function serverApiUrl(path: string) {
  return new URL(path, readClientEnvironment().serverApiOrigin);
}
