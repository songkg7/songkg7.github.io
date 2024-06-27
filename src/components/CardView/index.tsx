import React from "react";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";

function Card() {
    return (
        <div className="card col col--4">
            <div className={"card__image"}>
                image
            </div>
            <div className="card__header text--center">
                <Heading as={"h1"}>Card Header</Heading>
            </div>
            <div className={"card__body"}>
                <p>Card summary</p>
            </div>
            <Link to="/blog" className="button button--link">
                More
            </Link>
        </div>
    )
}

// front matter 에 pin:true 가 있을 경우 메인에 표시
export default function CardView(): React.JSX.Element {

    return (
        <div className="container">
            <div className="row">
                {Card()}
                {Card()}
                {Card()}
                {Card()}
            </div>
        </div>
    );
}
