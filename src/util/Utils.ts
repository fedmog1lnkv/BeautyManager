export const fileToBase64 = (file: File): Promise<string | ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            const strRes = reader.result.toString();
            const res = strRes.slice(strRes.indexOf(',') + 1);
            return resolve(res);
        };
        reader.onerror = (error) => reject(error);
    });
};

export function isEmpty(value: string) {
    return !value || value.trim().length === 0;
}
