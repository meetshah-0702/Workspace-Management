document.addEventListener('DOMContentLoaded', (event) => {
    const openModalButtons = document.querySelectorAll('.clickable-class');
    const closeModalButtons = document.querySelectorAll('[data-close-button]');
    const overlay = document.getElementById('overlay');
    let currentClassId = null;

    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.querySelector(button.dataset.modalTarget);
            const title = button.dataset.modalTitle;
            const classId = button.dataset.classId;
            currentClassId = classId;

            const modalTitle = modal.querySelector('.modal-title');
            if (modalTitle) modalTitle.textContent = title;
            openModal(modal);
            fetchAndDisplayAssets(currentClassId);
        });
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    document.getElementById('addAssetButton').addEventListener('click', () => {
        const addAssetForm = document.getElementById('addAssetForm');
        addAssetForm.style.display = addAssetForm.style.display === 'block' ? 'none' : 'block';
        document.getElementById('deleteAssetForm').style.display = 'none';
        document.getElementById('updateAssetForm').style.display = 'none';
    });

    function openModal(modal) {
        if (modal == null) return;
        modal.classList.add('active');
        overlay.classList.add('active');
    }

    function closeModal(modal) {
        if (modal == null) return;
        modal.classList.remove('active');
        overlay.classList.remove('active');
    }

    overlay.addEventListener('click', () => {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            closeModal(modal);
        });
    });

    document.getElementById('submitAsset').addEventListener('click', () => {
        const name = document.getElementById('assetName').value;
        const quantity = document.getElementById('assetQuantity').value;

        fetch('/api/assets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ classId: currentClassId, name, quantity })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            fetchAndDisplayAssets(currentClassId);
        });

        document.getElementById('assetName').value = '';
        document.getElementById('assetQuantity').value = '';
        document.getElementById('addAssetForm').style.display = 'none';
    });

    function fetchAndDisplayAssets(classId) {
        fetch(`/api/assets?classId=${classId}`)
            .then(response => response.json())
            .then(assets => {
                const container = document.getElementById('assetsContainer');
                container.innerHTML = '';
                assets.forEach(asset => {
                    const assetDiv = document.createElement('div');
                    assetDiv.classList.add('assetDivision', 'asset');
                    assetDiv.innerHTML = `Name: ${asset.name}<br>Quantity: ${asset.quantity}`;
                    container.appendChild(assetDiv);
                });
            });
    }

    // Additional functionalities for deleting and updating assets

    document.getElementById('deleteAssetButton').addEventListener('click', () => {
        const deleteAssetForm = document.getElementById('deleteAssetForm');
        deleteAssetForm.style.display = deleteAssetForm.style.display === 'block' ? 'none' : 'block';
        document.getElementById('addAssetForm').style.display = 'none';
        document.getElementById('updateAssetForm').style.display = 'none';
    });

    document.getElementById('deleteAsset').addEventListener('click', () => {
        const name = document.getElementById('assetNameToDelete').value;

        fetch('/api/assets', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ classId: currentClassId, name })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            fetchAndDisplayAssets(currentClassId);
        });

        document.getElementById('assetNameToDelete').value = '';
        document.getElementById('deleteAssetForm').style.display = 'none';
    });

    document.getElementById('updateAssetButton').addEventListener('click', () => {
        const updateAssetForm = document.getElementById('updateAssetForm');
        updateAssetForm.style.display = updateAssetForm.style.display === 'block' ? 'none' : 'block';
        document.getElementById('addAssetForm').style.display = 'none';
        document.getElementById('deleteAssetForm').style.display = 'none';
    });

    document.getElementById('updateAsset').addEventListener('click', () => {
        const name = document.getElementById('assetNameToUpdate').value;
        const quantity = document.getElementById('assetQuantityToUpdate').value;

        fetch('/api/assets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ classId: currentClassId, name, quantity })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            fetchAndDisplayAssets(currentClassId);
        });

        document.getElementById('assetNameToUpdate').value = '';
        document.getElementById('assetQuantityToUpdate').value = '';
        document.getElementById('updateAssetForm').style.display = 'none';
    });

    document.getElementById('clearAllButton').addEventListener('click', () => {
        fetch('/api/assets/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ classId: currentClassId })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            fetchAndDisplayAssets(currentClassId);
        });
    });
});
