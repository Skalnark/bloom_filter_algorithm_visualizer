// Example: "Value of the hash is: {{hashValue}}"
export class StringBuilder {
    static buildStr(str, replacements) {
        for (const key in replacements) {
            const placeholder = `{{${key}}}`;
            str = str.replace(new RegExp(placeholder, 'g'), replacements[key]);
        }
        return str;
    }
}

export default StringBuilder;