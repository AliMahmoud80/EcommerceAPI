module.exports = {
  apps: [
    {
      script: './build/app.js',
      watch: '.',
      instances: 'max',
    },
  ],
}
