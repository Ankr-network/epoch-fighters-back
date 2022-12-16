class ProbabilityBasedRandom {
  constructor(variants, frequency) {
    this.variants = variants;
    this.probSumList = this.calculateProbabilitySum(frequency);
  }

  next() {
    const variantsLength = this.variants.length - 1;

    const randomSeed = Math.random() * this.probSumList[variantsLength];
    let ceilIndex = this.findCeil(this.probSumList, randomSeed, variantsLength);

    return this.variants[ceilIndex];
  }

  calculateProbabilitySum(frequency) {
    const probSumList = [];

    probSumList[0] = frequency[0];

    for (let i = 1; i < frequency.length; ++i) {
      probSumList[i] = probSumList[i - 1] + frequency[i];
    }

    return probSumList;
  }

  findCeil(probSumList, randomSeed) {
    let zeroGround = 0;

    for (let i = 0; i < probSumList.length; i++) {
      if(randomSeed >= zeroGround && randomSeed < probSumList[i]) {
        return i
      }
      zeroGround = probSumList[i];
    }
  }
}

module.exports = {
  ProbabilityBasedRandom
}
