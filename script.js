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
        alert(`Block #${new_block.index} mined successfully!`);
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
        `;
        document.getElementById('blockchain-display').appendChild(blockElement);
    }
}

let blockchain = null;

document.getElementById('create-blockchain-btn').addEventListener('click', () => {
    blockchain = new Blockchain();
    document.getElementById('block-form').classList.remove('hidden');
    document.getElementById('mine-block-btn').classList.remove('hidden');
    document.getElementById('validate-blockchain-btn').classList.remove('hidden');
    document.getElementById('reset-blockchain-btn').classList.remove('hidden');
});

document.getElementById('add-block-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = document.getElementById('data').value;
    const new_block = new Block(blockchain.chain.length, new Date().toISOString(), data, '');
    blockchain.add_block(new_block);
    document.getElementById('data').value = '';
});

document.getElementById('show-blockchain-btn').addEventListener('click', () => {
    document.getElementById('blockchain-display').classList.toggle('hidden');
});

document.getElementById('mine-block-btn').addEventListener('click', () => {
    const data = `Block ${blockchain.chain.length}`;
    const new_block = new Block(blockchain.chain.length, new Date().toISOString(), data, blockchain.get_latest_block().hash);
    blockchain.mine_block(new_block);
});

document.getElementById('validate-blockchain-btn').addEventListener('click', () => {
    const isValid = blockchain.is_valid();
    alert(`Blockchain is valid: ${isValid}`);
});

document.getElementById('reset-blockchain-btn').addEventListener('click', () => {
    blockchain = new Blockchain();
    document.getElementById('blockchain-display').innerHTML = ''; // Clear existing blocks
});
