import React from "react";
import Select from "react-select";

export default class RefreshSelector extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
        this.updateBucket = this.updateBucket.bind(this);
    }

    updateBucket = data => {
        this.props.setParentState({ bucketMs: data });
    };

    render() {
        const timeBucketOptions = [
            { key: 1, label: "30 sec", value: 30000 },
            { key: 2, label: "1 min", value: 60000 },
            { key: 3, label: "2 min", value: 120000 },
            { key: 4, label: "3 min", value: 180000 },
            { key: 5, label: "4 min", value: 240000 },
            { key: 6, label: "5 min", value: 300000 }
        ];

        return (
            <div className="react-select-input-group" style={{ width: "100px" }}>
                <label>Refresh</label>
                <Select
                    options={timeBucketOptions}
                    onChange={this.updateBucket}
                    value={this.props.bucketMs}
                    classNamePrefix="react-select"
                />
            </div>
        );
    }
}
