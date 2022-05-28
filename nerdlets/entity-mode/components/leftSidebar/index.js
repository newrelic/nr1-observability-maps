/* 
eslint no-use-before-define: 0,
no-console: 0,
*/ // --> OFF

import React, { useContext, useMemo } from 'react';
import { Button, Card, CardHeader, CardBody, HeadingText } from 'nr1';
import DataContext from '../../context/data';
import _ from 'lodash';

function LeftSidebar() {
  const { updateDataState, dataDrawer, gravity, linkLength } = useContext(
    DataContext
  );

  const handleUpdate = key => {
    if (key === dataDrawer) {
      updateDataState({ dataDrawer: null });
    } else {
      updateDataState({ dataDrawer: key });
    }
  };

  return useMemo(() => {
    return (
      <>
        <Card collapsible>
          <CardHeader title="Map" style={{ marginBottom: '0px' }} />
          <CardBody style={{ marginTop: '5px', marginLeft: '22px' }}>
            <HeadingText
              type={HeadingText.TYPE.HEADING_6}
              style={{ marginBottom: '3px', marginLeft: '14px' }}
            >
              Gravity ({gravity})
            </HeadingText>
            <input
              style={{ marginBottom: '3px', marginLeft: '14px' }}
              type="range"
              min="50"
              max="1000"
              step="50"
              value={gravity}
              class="slider"
              onChange={e =>
                updateDataState({ gravity: parseInt(e.target.value) })
              }
            />

            <HeadingText
              type={HeadingText.TYPE.HEADING_6}
              style={{
                marginBottom: '3px',
                marginLeft: '14px',
                marginTop: '0px'
              }}
            >
              Link Length ({linkLength})
            </HeadingText>
            <input
              style={{ marginBottom: '3px', marginLeft: '14px' }}
              type="range"
              min="50"
              max="1000"
              step="25"
              value={linkLength}
              class="slider"
              onChange={e =>
                updateDataState({ linkLength: parseInt(e.target.value) })
              }
            />
          </CardBody>
        </Card>
        <Card collapsible>
          <CardHeader title="Explore" style={{ marginBottom: '0px' }} />
          <CardBody style={{ marginTop: '5px', marginLeft: '22px' }}>
            <Button
              sizeType={Button.SIZE_TYPE.MEDIUM}
              type={Button.TYPE.PLAIN}
              onClick={() => handleUpdate('processes')}
            >
              Processes
            </Button>
            <br />
            <Button
              sizeType={Button.SIZE_TYPE.MEDIUM}
              type={Button.TYPE.PLAIN}
              onClick={() => handleUpdate('connections')}
            >
              Connections
            </Button>
            <br />
            <Button
              sizeType={Button.SIZE_TYPE.MEDIUM}
              type={Button.TYPE.PLAIN}
              onClick={() => handleUpdate('storage')}
            >
              Storage
            </Button>
            <br />
            <Button
              sizeType={Button.SIZE_TYPE.MEDIUM}
              type={Button.TYPE.PLAIN}
              onClick={() => handleUpdate('diskio')}
            >
              Disk IO
            </Button>
            <br />
            <Button
              sizeType={Button.SIZE_TYPE.MEDIUM}
              type={Button.TYPE.PLAIN}
              onClick={() => handleUpdate('services')}
            >
              Services
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }, [updateDataState, dataDrawer, gravity, linkLength]);
}

export default LeftSidebar;
