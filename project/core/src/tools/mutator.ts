import Generator from './generator.js';

const generator = new Generator();

class Mutator {
  private replaceCharactersWithCustomIndication({ match, type, min, max }: {
    match: string,
    type: string,
    min: string,
    max: string
  }): string {
    let operation = match;

    switch (type) {
      case 'n':
        operation = generator.generateRandomNumericString(generator.generateRandomNumberBetween(Number(min), Number(max))); break;
      case 'l':
        operation = generator.generateRandomLetterString(generator.generateRandomNumberBetween(Number(min), Number(max))); break;
      case 'm':
        operation = generator.generateRandomMultiString(generator.generateRandomNumberBetween(Number(min), Number(max))); break;
      case 's':
        operation = generator.generateRandomSpecialString(generator.generateRandomNumberBetween(Number(min), Number(max))); break;
      default: 
        break;
    }

    return operation;
  }

  private replaceCharactersInAny(input: string): string {
    input = input
      .replace(/\[(.+)\]/g, (_, value) => generator.chooseRandomValueFromArray(value.split(';')));

    input = input
      .replace(/#([nlms])\((\d+)-(\d+)\)/g, (match, type, min, max) => this.replaceCharactersWithCustomIndication({ 
        match: match,
        type: type,
        min: min,
        max: max
      }));

    input = input
      .replace(/#n/g, () => generator.generateRandomNumericString(3))
      .replace(/#l/g, () => generator.generateRandomLetterString(3))
      .replace(/#m/g, () => generator.generateRandomMultiString(3))
      .replace(/#s/g, () => generator.generateRandomSpecialString(3));
      
    return input
  }

  private replaceCharactersInNickname(input: string): string {
    input = input
      .replace(/\[(.+)\]/g, (_, value) => generator.chooseRandomValueFromArray(value.split(';')));

    input = input
      .replace(/#([nlms])\((\d+)-(\d+)\)/g, (match, type, min, max) => this.replaceCharactersWithCustomIndication({ 
        match: match,
        type: type,
        min: min,
        max: max
      }));

    input = input
      .replace(/#n/g, () => generator.generateRandomNumericString(3))
      .replace(/#l/g, () => generator.generateRandomLetterString(3))
      .replace(/#m/g, () => generator.generateRandomMultiString(3))
      .replace(/#s/g, () => generator.generateRandomSpecialString(3));
      
    return input
  }

  private replaceCharactersInPassword(input: string): string {
    input = input
      .replace(/\[(.+)\]/g, (_, value) => generator.chooseRandomValueFromArray(value.split(';')));

    input = input
      .replace(/#([nlms])\((\d+)-(\d+)\)/g, (match, type, min, max) => this.replaceCharactersWithCustomIndication({ 
        match: match,
        type: type,
        min: min,
        max: max
      }));

    input = input
      .replace(/#n/g, () => generator.generateRandomNumericString(3))
      .replace(/#l/g, () => generator.generateRandomLetterString(3))
      .replace(/#m/g, () => generator.generateRandomMultiString(3))
      .replace(/#s/g, () => generator.generateRandomSpecialString(3));

    return input
  }

  private replaceCharactersInBotMessage(input: string, players: string[]): string {
    input = input
      .replace(/\[(.+)\]/g, (_, value) => generator.chooseRandomValueFromArray(value.split(';')));

    input = input
      .replace(/#([nlms])\((\d+)-(\d+)\)/g, (match, type, min, max) => this.replaceCharactersWithCustomIndication({ 
        match: match,
        type: type,
        min: min,
        max: max
      }));

    input = input
      .replace(/#n/g, () => generator.generateRandomNumericString(3))
      .replace(/#l/g, () => generator.generateRandomLetterString(3))
      .replace(/#m/g, () => generator.generateRandomMultiString(3))
      .replace(/#s/g, () => generator.generateRandomSpecialString(3))
      .replace(/#p/g, () => generator.chooseRandomValueFromArray(players));

    return input
  }

  public mutateString({ type, input, data }: {
    type: string,
    input: string,
    data: any
  }): string {
    switch (type) {
      case 'any':
        return this.replaceCharactersInAny(input);
      case 'nickname':
        return this.replaceCharactersInNickname(input);
      case 'password':
        return this.replaceCharactersInPassword(input);
      case 'message':
        return this.replaceCharactersInBotMessage(input, data.players);
      default: 
        return input;
    }
  }
}

export default Mutator;