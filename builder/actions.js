class Action {
    label;

    constructor(label) {
        this.label = label;
    }
}

class MoveTo extends Action {
    i; j;

    constructor(i,j) {
        super("Move to");
        this.i = i;
        this.j = j;
    }

    getDescription() {
        return `${this.label} ${i},${j}`;
    }
}

