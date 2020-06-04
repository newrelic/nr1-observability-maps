import 'ace-builds/src-noconflict/mode-sql';

export class CustomHighlightRules extends window.ace.acequire(
  'ace/mode/text_highlight_rules'
).TextHighlightRules {
  constructor() {
    super();

    const keywords =
      'SELECT|FROM|SHOW EVENT TYPES|WHERE|AS|FACET|FACET CASES|LIMIT|SINCE|UNTIL|WITH TIMEZONE|COMPARE WITH|TIMESERIES|EXTRAPOLATE|AUTO|MAX|AND';

    const builtinConstants = 'true|false';

    const builtinFunctions =
      'apdex|average|buckets|count|eventType|filter|funnel|histogram|keyset|latest|max|median|min|percentage|percentile|rate|stddev|sum|uniqueCount|uniques';

    const dataTypes =
      'int|numeric|decimal|date|varchar|char|bigint|float|double|bit|binary|text|set|timestamp|' +
      'money|real|number|integer';

    const keywordMapper = this.createKeywordMapper(
      {
        'nrql.function': builtinFunctions,
        keyword: keywords,
        'constant.language': builtinConstants,
        'storage.type': dataTypes
      },
      'identifier',
      true
    );

    this.$rules = {
      start: [
        {
          token: 'comment',
          regex: '#.*$'
        },
        {
          token: 'nrql.string',
          regex: '".*?"'
        },
        {
          token: 'nrql.string',
          regex: "'.*?'"
        },
        {
          token: keywordMapper,
          regex: '[a-zA-Z_$][a-zA-Z0-9_$]*\\b'
        },
        {
          token: 'nrql.operator',
          regex:
            '\\+|\\-|\\/|\\/\\/|%|&|<|>|<=|=>|==|!=|<>|=|IN|IS|NOT|LIKE|LIKE|NULL'
        },
        {
          token: 'nrql.numeric', // float
          regex: '[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b'
        }
      ]
    };
  }
}

export default class CustomNrqlMode extends window.ace.acequire('ace/mode/sql')
  .Mode {
  constructor() {
    super();
    this.HighlightRules = CustomHighlightRules;
  }
}
