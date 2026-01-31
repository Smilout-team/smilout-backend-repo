export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'jira-key-in-scope': (parsed) => {
          const { scope } = parsed;
          const jiraRegex = /^SMILOUT-\d+$/;
          if (!scope) {
            return [
              false,
              'Commit must have Jira Key in scope (VD: feat(SMILOUT-123): ...)',
            ];
          }
          if (!jiraRegex.test(scope)) {
            return [
              false,
              `Scope "${scope}" is invalid format. There must be a Jira Key (VD: SMILOUT-123)`,
            ];
          }

          return [true];
        },
      },
    },
  ],

  rules: {
    'scope-case': [0],
    'scope-empty': [2, 'never'],
    'jira-key-in-scope': [2, 'always'],
  },
};
