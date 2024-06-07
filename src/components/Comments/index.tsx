import React from "react";
import Giscus from "@giscus/react";
import {useColorMode} from "@docusaurus/theme-common";

export default function Comments(): JSX.Element {
    const {colorMode} = useColorMode();

    return (
        <div>
            <Giscus
                id="comments"
                repo="songkg7/haril.dev"
                repoId="R_kgDOL2FYyw"
                category="General"
                categoryId="DIC_kwDOL2FYy84CfI7R"
                mapping="pathname"
                strict="0"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="bottom"
                theme={colorMode === "dark" ? "dark_tritanopia" : "light_tritanopia"}
            ></Giscus>
        </div>
    );
}
