export class Util {


    /**
     * Verifica se objeto está vazio, sem chaves.
     * Referência: https://coderwall.com/p/_g3x9q/how-to-check-if-javascript-object-is-empty
     * @param obj
     */
    static isObjectEmpty(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Gerador de UUID.
     * Autor: https://stackoverflow.com/posts/2117523/revisions
     */
    static uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static diffBetweenDates(dateOne, dateTwo) {
        return  Math.floor(
          (Date.UTC(dateTwo.getFullYear(),
        dateTwo.getMonth(),
        dateTwo.getDate()) -
        Date.UTC(dateOne.getFullYear(),
        dateOne.getMonth(), dateOne.getDate()) ) / (1000 * 60 * 60 * 24)
        );
    }

    static formatarData(data) {
        return new Date (data.seconds * 1000).toLocaleString();
    }

    static firestoreDateToDate(data) {
        return new Date (data.seconds * 1000);
    }

    static getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }



}
