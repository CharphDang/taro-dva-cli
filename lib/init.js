const {
  shell,
  fs,
  inquirer,
  figlet,
  clear,
  logSuccess,
  logError,
  logWarning,
  logInfo,
  spawn
} = require('./utils')
const { clone } = require('./download')

const REMOTE = 'https://gitee.com/charph/taro-dva-template.git'
const BRANCH = 'master'

module.exports = async name => {
  // 打印欢迎画面
  clear()
  const data = await figlet('Taro Dva')
  logInfo(data)
  logInfo('🚀 Create Project:' + name)

  // //  0. 检查控制台是否可以运行`git `，
  if (!shell.which('git')) {
    logError('Sorry, your system dose not support Git.')
    shell.exit(1)
  }

  // * 1. 验证输入name是否合法
  if (fs.existsSync(name)) {
    logWarning(`Already exist directory ${name}`)
    return
  }
  if (name.match(/[^A-Za-z0-9\u4e00-\u9fa5_-]/g)) {
    logError('Illegal characters in project name')
    return
  }

  // 下载模板
  try {
    await clone(`direct:${REMOTE}#${BRANCH}`, name, { clone: true })
  } catch (error) {
    logError(error, 'err') // Charph-log
    return
  }

  logSuccess('⬇️  Download Template Success')

  // 5. 清理文件
  const deleteDir = ['.git', 'README.md'] // 需要清理的文件
  const pwd = shell.pwd()
  deleteDir.map(item => shell.rm('-rf', pwd + `/${name}/${item}`))

  // ------------------------------------

  // 定义需要询问的问题
  const questions = [
    {
      type: 'input',
      message: 'Please enter the template name:',
      name: 'name',
      validate(val) {
        if (!val) return 'Template name cannot be empty!'
        if (val.match(/[^A-Za-z0-9\u4e00-\u9fa5_-]/g))
          return 'The template name contains illegal characters. Please re-enter it'
        return true
      }
    },
    {
      type: 'input',
      message: 'Please enter the template description:',
      name: 'description'
    },
    {
      type: 'input',
      message: 'Please enter your name:',
      name: 'author'
    }
  ]
  // 通过inquirer获取到用户输入的内容
  const answers = await inquirer.prompt(questions)
  // 将用户的配置打印，确认一下是否正确
  console.log(answers)

  let confirm = await inquirer.prompt([
    {
      type: 'confirm',
      message: 'Confirm the creation ?',
      default: 'Y',
      name: 'isConfirm'
    }
  ])

  if (confirm.isConfirm) {
    // 根据用户配置调整文件
    let jsonData = fs.readFileSync(`${name}/package.json`)
    jsonData = JSON.parse(jsonData)
    for (item in answers) {
      jsonData[item] = answers[item]
    }
    console.log(jsonData)
    let obj = JSON.stringify(jsonData, null, '\t')
    fs.writeFileSync(`${name}/package.json`, obj)
  } else {
    logWarning('You dismiss the configuration just now')
  }

  // 通过inquirer获取到用户输入的内容
  const util = await inquirer.prompt([
    {
      type: 'list',
      name: 'environment',
      message: 'Your choice:',
      choices: [
        {
          value: 1,
          name: 'yarn'
        },
        {
          value: 2,
          name: 'npm'
        }
      ]
    }
  ])
  //  --------------------------------------------
  const ora = require('ora')
  const process = ora(`🚘 Install Dependences ...`)
  process.start()

  try {
    if (util.environment === 1) {
      await spawn('yarn', { cwd: `./${name}`, shell: true })
    } else {
      await spawn('npm', ['install'], { cwd: `./${name}`, shell: true })
    }
    process.succeed()
  } catch (error) {
    process.fail()
    logError(error, 'err') // Charph-log
    return
  }

  logSuccess(`
      👌 安装完成：
      To get Start:
      ===========================
      cd ${name}
      yarn dev:weapp
      or
      npm run dev:weapp
      ===========================
      `)

  // 打开浏览器
  // open(`http://localhost:8080`)
  // await spawn('npm', ['run', 'serve'], { cwd: `./${name}` })
}
