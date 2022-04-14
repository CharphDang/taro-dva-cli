const { ora, download } = require('./utils')

module.exports.clone = async function (repo, desc, option) {
  const process = ora(`Downloading Template ...`)
  process.start()
  try {
    await download(repo, desc, option)
    process.succeed()
  } catch (error) {
    process.fail()
    throw Error(error)
  }
}
