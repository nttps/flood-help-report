import { ka } from "date-fns/locale";
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default <Partial<Config>>{
    theme: {
        extend: {
            fontFamily: {
                sans: ["Sarabun", ...defaultTheme.fontFamily.sans],
                kanit: ["Kanit", ...defaultTheme.fontFamily.sans],
            },
        },
    },
};
