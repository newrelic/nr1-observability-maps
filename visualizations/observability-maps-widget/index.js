import React from 'react';

import ObservabilityMapsCore from '../../nerdlets/observability-maps-nerdlet';

export default class ObservabilityMapsWidgetVisualization extends React.Component {
  render() {
    return <ObservabilityMapsCore isWidget vizConfig={this.props} />;
  }
}
