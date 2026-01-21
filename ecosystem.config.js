module.exports = {
  apps: [
    {
      name: 'MDS_PWA',
      port: '3000',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
    },
  ],
}
