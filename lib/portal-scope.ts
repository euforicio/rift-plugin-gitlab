declare const __BB_PLUGIN_ID__: string | undefined;

export function usePortalScopeProps(): {
  "data-rift-portaled-overlay": "";
  "data-rift-plugin-root"?: "";
  "data-rift-plugin"?: string;
} {
  const pluginId =
    typeof __BB_PLUGIN_ID__ === "string" ? __BB_PLUGIN_ID__ : undefined;
  return {
    "data-rift-portaled-overlay": "",
    "data-rift-plugin-root": "",
    ...(pluginId !== undefined ? { "data-rift-plugin": pluginId } : {}),
  };
}
