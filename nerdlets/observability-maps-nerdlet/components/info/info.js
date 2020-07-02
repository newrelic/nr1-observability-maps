import React from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import { DataConsumer } from '../../context/data';

export default class Info extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <DataConsumer>
        {({ mapData }) => {
          return 'settings' in mapData &&
            'infoText' in mapData.settings &&
            mapData.settings.infoText.trim() !== '' ? (
            <div
              className="info-panel"
              style={{
                zIndex: 1,
                position: 'absolute',
                padding: '1em',
                color: 'white',
                backgroundColor: 'transparent'
              }}
            >
              <Popup
                trigger={<Icon circular name="info circle" size="large" />}
                position="bottom left"
                content={mapData.settings.infoText}
                inverted
              />
            </div>
          ) : null;
        }}
      </DataConsumer>
    );
  }
}
