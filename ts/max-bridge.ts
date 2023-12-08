let maxApi: any = (window as any).max;

export function outputMax(mess: any) {
    if (maxApi)
        maxApi.outlet(mess);
}
  
export function outputMaxDict(dstr: any) {
    if (maxApi)
        maxApi.outlet("dictionary", dstr);
}

export function setMaxDict(d: any) {
    if (maxApi)
        maxApi.setDict('handdict', d);
}

export const bindMaxFunctions = async () => {
    maxApi.bindInlet("devices", () => {
        if (!navigator.mediaDevices?.enumerateDevices) {
            maxApi.outlet("devices", 0, "enumerateDevices not supported");
        } else {
            navigator.mediaDevices
                .enumerateDevices()
                .then((devices) => {
                    const descriptions = devices.map(d => [d.kind, d.label, d.deviceId]).reduce((p, t) => p.concat(t), []);
                    maxApi.outlet("devices", 1, ...descriptions);
                })
                .catch((err) => {
                    maxApi.outlet("devices", 0, `${err.name}: ${err.message}`);
                });
        }
    });

    maxApi.outlet("maxapi", 1);
}
