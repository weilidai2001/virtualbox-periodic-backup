export const replaceAll = (str, find, replace) => {
    return str.replace(new RegExp(find, 'g'), replace);
};

export const now = () => new Date();