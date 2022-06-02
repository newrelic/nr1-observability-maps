import { navigation } from 'nr1';

export const instrumentationAnalysis = (
  integrations,
  results,
  facets,
  keys
) => {
  if (integrations) {
    (results || []).forEach(r => {
      const valuesToCheck = [];

      (facets || []).forEach(f => {
        if (r.facet[f]) valuesToCheck.push(r.facet[f]);
      });

      (keys || []).forEach(k => {
        const value = r[k] || r[`latest.${k}`];
        if (value) valuesToCheck.push(value);
      });

      if (valuesToCheck.length > 0) {
        Object.keys(integrations).forEach(category => {
          const integrationList = integrations[category];

          integrationList.forEach(integration => {
            const { matches, installNerdlet, notMatch } = integration;
            const notMatches = notMatch || [];

            (matches || []).forEach(match => {
              // check process events
              const ignoreMatch = valuesToCheck.some(a =>
                notMatches.some(n => a.includes(n))
              );

              if (valuesToCheck.includes(match) && !ignoreMatch) {
                r.instrument = integration;

                if (installNerdlet) {
                  const stackedNerdlet = installNerdlet;
                  // inject account id?

                  r.instrument.onClick = () =>
                    navigation.openStackedNerdlet(stackedNerdlet);
                }
              }
            });
          });
        });
      }
    });
  }
};
