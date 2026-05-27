const scanner = require('sonarqube-scanner').default;

scanner(
  {
    serverUrl: "http://localhost:9000",
    token: "sqp_a4b68a02711da98a5f6102ae51f8329f6c251537",
    options: {
      "sonar.projectKey": "Frontend-ELearning",
      "sonar.sources": "app,components,lib,store",
      "sonar.exclusions": "node_modules/**,.next/**,public/**,**/*.test.tsx",
    },
  },
  () => process.exit()
);