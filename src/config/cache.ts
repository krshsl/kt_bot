import { User } from "@supabase/supabase-js";
import { LRUCache } from "lru-cache";

// ideally our value should expire in 5 mins, but we use the least of 5mins / expiry time
export const userCache = new LRUCache<string, User>({
  max: 1000,
});
