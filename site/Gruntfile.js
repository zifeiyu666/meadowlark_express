module.exports = function(grunt) { 
  // 加载插件
  [
      'grunt-cafe-mocha',
      'grunt-contrib-jshint',
      'grunt-exec',
  ].forEach(function(task){ 
      grunt.loadNpmTasks(task);
  });
  // 配置插件
  grunt.initConfig({
          // 测试
          cafemocha: {
                  all: { src: 'qa/tests-*.js', options: { ui: 'tdd' }, }
          },
          // 去毛
          jshint: {
                  app: ['cosmoplat.js', 'public/js/**/*.js',
                                  'lib/**/*.js'],
                  qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
          },
          // 运行命令行命令
          exec: {
                  linkchecker:
                       { cmd: 'echo 1111' }
          }, 
  });
  // 注册任务
  // grunt.registerTask('default', ['cafemocha','jshint','exec']);
  grunt.registerTask('default', ['cafemocha', 'exec']);
};
