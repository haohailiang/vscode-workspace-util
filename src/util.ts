export const isWindows = process.platform === 'win32';

const removePrefixSlash = (pathName: string) => {
    return pathName && pathName[0] === "/" ? pathName.substr(1) : pathName;
};

export const getCurrentWorkspaceFolder = (uriPath: string) => {
    return isWindows ? removePrefixSlash(uriPath) : uriPath;
};
