class ProbabilityBasedRandom {
  constructor(rarityConfig) {
    this.variants = this.collectVariants(rarityConfig);
    const rarityValues = this.collectRarityValues(rarityConfig);
    this.probSumList = this.calculateProbabilitySum(rarityValues);
    this.probabilitySum = this.getProbabilitySum();
  }

  next() {
    const randomSeed = Math.random() * this.probabilitySum;
    let ceilIndex = this.findCeil(this.probSumList, randomSeed);

    return this.variants[ceilIndex];
  }

  calculateProbabilitySum(rarityValues) {
    const probSumList = [];

    probSumList[0] = rarityValues[0];

    for (let i = 1; i < rarityValues.length; ++i) {
      probSumList[i] = probSumList[i - 1] + rarityValues[i];
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

  getProbabilitySum() {
    const variantsLength = this.variants.length - 1;
    return this.probSumList[variantsLength];
  }

  collectVariants(rarityConfig) {
    return Object.keys(rarityConfig);
  }

  collectRarityValues(rarityConfig) {
    return Object.values(rarityConfig);
  }
}

module.exports = {
  ProbabilityBasedRandom
}
