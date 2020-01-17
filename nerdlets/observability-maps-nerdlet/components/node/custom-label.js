import React from "react";

export default class CustomLabel extends React.PureComponent {
    determineBackgroundColor() {
        return "grey";
    }

    determineTypeStyle() {}

    render() {
        const { node } = this.props;

        // need logic to determine node health

        console.log(node);

        return (
            "Hello There" + "&#013;&#010;" + "Bye"
            // <div style={{backgroundColor:"red", width:"100px", height: "100px"}}>
            //     <span style={{fontColor:"white"}}>hello {node.id}</span>
            // </div>
        );
    }
}
