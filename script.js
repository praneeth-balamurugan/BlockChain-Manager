class Block {
    constructor(index, timestamp, data, previous_hash) {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previous_hash = previous_hash;
        this.nonce = 0; // Add nonce for proof of work
        this.hash = this.calculate_hash();
    }

    calculate_hash() {
        const sha = new jsSHA("SHA-256", "TEXT");
        sha.update(this.index + this.timestamp + this.data + this.previous_hash + this.nonce);
        return sha.getHash("HEX");
    }

    mine_block(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculate_hash();
        }
        console.log("Block mined: " + this.hash);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.create_genesis_block()];
        this.difficulty = 4; // Set difficulty level for proof of work
    }

    create_genesis_block() {
        return new Block(0, new Date().toISOString(), "Genesis Block", "0");
    }

    get_latest_block() {
        return this.chain[this.chain.length - 1];
    }

    add_block(new_block) {
        new_block.previous_hash = this.get_latest_block().hash;
        this.mine_block(new_block); // Mine the block
        this.chain.push(new_block);
        this.render_block(new_block);
    }

    mine_block(new_block) {
        new_block.mine_block(this.difficulty);
        this.show_feedback(`Block #${new_block.index} mined successfully!`);
    }

    is_valid() {
        for (let i = 1; i < this.chain.length; i++) {
            const current_block = this.chain[i];
            const previous_block = this.chain[i - 1];

            if (current_block.hash !== current_block.calculate_hash()) {
                return false;
            }

            if (current_block.previous_hash !== previous_block.hash) {
                return false;
            }
        }
        return true;
    }

    render_block(block) {
        const blockElement = document.createElement('div');
        blockElement.classList.add('block');
        blockElement.innerHTML = `
            <p><strong>Block #${block.index}</strong></p>
            <p><strong>Timestamp:</strong> ${block.timestamp}</p>
            <p><strong>Data:</strong> ${block.data}</p>
            <p><strong>Hash:</strong> ${block.hash}</p>
            <p><strong>Previous Hash:</strong> ${block.previous_hash}</p>
            <p><strong>Nonce:</strong> ${block.nonce}</p>
            <button class="edit-block-btn" data-index="${block.index}">Edit</button>
            <button class="delete-block-btn" data-index="${block.index}">Delete</button>
        `;
        document.getElementById('blockchain-display').appendChild(blockElement);

        blockElement.querySelector('.edit-block-btn').addEventListener('click', () => this.edit_block(block.index));
        blockElement.querySelector('.delete-block-btn').addEventListener('click', () => this.delete_block(block.index));
    }

    show_feedback(message) {
        const feedback = document.getElementById('feedback');
        feedback.innerText = message;
        feedback.classList.remove('hidden');
        setTimeout(() => feedback.classList.add('hidden'), 3000);
    }

    edit_block(index) {
        const newData = prompt('Enter new data for the block:');
        if (newData) {
            const block = this.chain[index];
            block.data = newData;
            block.hash = block.calculate_hash();
            document.getElementById('blockchain-display').innerHTML = '';
            this.chain.forEach(block => this.render_block(block));
        }
    }

    delete_block(index) {
        if (confirm(`Are you sure you want to delete block #${index}?`)) {
            this.chain = this.chain.filter(block => block.index !== index);
            document.getElementById('blockchain-display').innerHTML = '';
            this.chain.forEach(block => this.render_block(block));
        }
    }
}

let blockchain = new Blockchain();

document.getElementById('add-block-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const data = document.getElementById('data').value;
    const newBlock = new Block(blockchain.chain.length, new Date().toISOString(), data, blockchain.get_latest_block().hash);
    blockchain.add_block(newBlock);
    document.getElementById('data').value = '';
});

document.getElementById('create-blockchain-btn').addEventListener('click', () => {
    blockchain = new Blockchain();
    document.getElementById('blockchain-display').innerHTML = '';
    blockchain.chain.forEach(block => blockchain.render_block(block));
    document.getElementById('validate-blockchain-btn').classList.remove('hidden');
    document.getElementById('reset-blockchain-btn').classList.remove('hidden');
    document.getElementById('blockchain-display').classList.remove('hidden');
});

document.getElementById('validate-blockchain-btn').addEventListener('click', () => {
    const isValid = blockchain.is_valid();
    blockchain.show_feedback(`Blockchain is ${isValid ? 'valid' : 'invalid'}`);
});

document.getElementById('reset-blockchain-btn').addEventListener('click', () => {
    blockchain = new Blockchain();
    document.getElementById('blockchain-display').innerHTML = '';
    blockchain.chain.forEach(block => blockchain.render_block(block));
});
