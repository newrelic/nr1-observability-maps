/* eslint 
no-console: 0
*/
import React from 'react';
import { Button } from 'semantic-ui-react';
import CreateMap from '../map/create';
import DeleteMap from '../map/delete';
import ExportMap from '../map/export';
import Select from 'react-select';
// import UserConfig from '../user-config';
import ManageNodes from '../node/manage';
import ManageLinks from '../link/manage';
import ImportMap from '../map/import';
import RefreshSelector from '../map/refresh';
import ManageIcons from '../icons/manage';
import MapSettings from '../map/settings';
import UserSettings from '../user/settings';
import { DataConsumer } from '../../context/data';

export default class MenuBar extends React.PureComponent {
  handleMapMenuChange = (
    selectedMap,
    availableMaps,
    updateDataContextState
  ) => {
    if (typeof selectedMap === 'string' || selectedMap instanceof String) {
      const map = availableMaps.filter(map => map.id === selectedMap);
      if (map.length === 1) {
        const selected = { value: map[0].id, label: map[0].id, type: 'user' };
        updateDataContextState({ selectedMap: selected }, ['loadMap']);
        console.log(`Map selected:`, selectedMap);
      }
    } else {
      updateDataContextState({ selectedMap }, ['loadMap']);
      console.log(`Map selected:`, selectedMap);
    }
  };

  render() {
    return (
      <DataConsumer>
        {({
          accounts,
          selectedMap,
          userMaps,
          accountMaps,
          updateDataContextState,
          timelineOpen,
          storageLocation,
          dataFetcher,
          selectMap,
          vizHideMenu
        }) => {
          const { isWidget } = this.props;
          const storageOptions = accounts.map(acc => ({
            key: acc.id,
            label: acc.name,
            value: acc.id,
            type: 'account'
          }));

          storageOptions.sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          });

          storageOptions.unshift({
            key: 'User',
            label: 'User (Personal)',
            value: 'user',
            type: 'user'
          });

          let availableMaps = [];

          if (accountMaps && storageLocation.type === 'account') {
            accountMaps = accountMaps.map(map => ({
              value: map.id,
              label: (map.id || '').replace(/\+/g, ' '),
              type: 'account'
            }));
            availableMaps = [...accountMaps];
          }

          if (userMaps && storageLocation.type === 'user') {
            userMaps = userMaps.map(map => ({
              value: map.id,
              label: map.id.replace(/\+/g, ' '),
              type: 'user'
            }));
            availableMaps = [...userMaps];
          }

          if (selectedMap)
            selectedMap.label = selectedMap.label.replace(/\+/g, ' ');

          if (vizHideMenu) {
            return '';
          }

          return (
            <div>
              <div className="utility-bar">
                {!isWidget && (
                  <>
                    <div className="react-select-input-group">
                      <label>Map Storage</label>
                      <Select
                        options={storageOptions}
                        onChange={async d => {
                          await updateDataContextState({
                            storageLocation: d
                          });
                          selectMap(null, true);
                          dataFetcher(['accountMaps']);
                        }}
                        value={storageLocation}
                        classNamePrefix="react-select"
                      />
                    </div>
                    <div className="react-select-input-group">
                      <label>Available Maps</label>
                      <Select
                        options={availableMaps}
                        onChange={map =>
                          this.handleMapMenuChange(
                            map,
                            availableMaps,
                            updateDataContextState
                          )
                        }
                        value={selectedMap}
                        classNamePrefix="react-select"
                      />
                    </div>

                    {selectedMap ? <DeleteMap /> : ''}

                    <CreateMap />

                    <ImportMap />

                    {selectedMap ? <ExportMap /> : ''}
                  </>
                )}

                <div className="flex-push" />

                {selectedMap ? <ManageNodes /> : ''}
                {selectedMap ? <ManageLinks /> : ''}

                {/* <UserConfig /> */}

                <ManageIcons />

                {selectedMap ? <MapSettings /> : ''}

                {selectedMap ? (
                  <Button
                    icon={timelineOpen ? 'clock' : 'clock outline'}
                    content="Timeline"
                    className="filter-button"
                    onClick={() =>
                      updateDataContextState({ timelineOpen: !timelineOpen })
                    }
                  />
                ) : (
                  ''
                )}

                <UserSettings />

                <RefreshSelector />
              </div>
            </div>
          );
        }}
      </DataConsumer>
    );
  }
}
