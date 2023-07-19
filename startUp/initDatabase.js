const chalk = require("chalk");
const classifierMock = require("../mock/classifier.json");
const ProductClassifier = require("../models/ProductClassifier");
const progressBar = require("cli-progress");

module.exports = async () => {
  const classifier = await ProductClassifier.find();
  if (classifier.length !== classifierMock.length) {
    const progress = new progressBar.SingleBar(
      { hideCursor: true },
      progressBar.Presets.shades_classic
    );
    console.log(chalk.green("Loading classifier:"));
    progress.start(classifierMock.length, 0);
    await createInitialEntity(ProductClassifier, classifierMock, progress);
    progress.stop();
    console.log(chalk.green("Done."));
  }
};

async function createInitialEntity(Model, data, progress) {
  await Model.collection.drop();
  return Promise.all(
    data.map(async (item) => {
      try {
        delete item._id;
        const newItem = new Model(item);
        await newItem.save();
        progress.increment();
        return newItem;
      } catch (e) {
        progress.stop();
        return e;
      }
    })
  );
}
