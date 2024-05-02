// fetch.js

let items = [];

// Функция для загрузки XML и преобразования его в JSON
function loadXML(url) {
    return fetch(url)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
            items = Array.from(data.querySelectorAll('item')).map(item => {
                return {
                    name: item.querySelector('name').textContent,
                    img: item.querySelector('img').textContent,
                    about: item.querySelector('about').textContent,
                    type: item.querySelector('type').textContent,
                    maker: item.querySelector('maker').textContent,
                    speed: parseInt(item.querySelector('speed').textContent, 10)
                };
            });
            return items;
        });
}

function populateFilters(items) {
    const typeFilter = document.getElementById('typeFilter');
    const makerFilter = document.getElementById('makerFilter');

    // Populate type filter
    const types = [...new Set(items.map(item => item.type))];
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });

    // Populate maker filter
    const makers = [...new Set(items.map(item => item.maker))];
    makers.forEach(maker => {
        const option = document.createElement('option');
        option.value = maker;
        option.textContent = maker;
        makerFilter.appendChild(option);
    });
}
// Функция для добавления элементов в items-list
function addItemsToDOM(items) {
    const itemsList = document.querySelector('.items-list');
    // Очищаем список перед добавлением новых элементов
    itemsList.innerHTML = '';
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.innerHTML = `
            <img src="${item.img}">
            <h3>${item.name}</h3>
            <h3>Тип: ${item.type}</h3>
        `;
        // Добавляем обработчик событий onclick
        itemDiv.onclick = function() {
            loadItemDetails('/Printinvest/catalog/items/items.xml', item.name);
        };
        itemsList.appendChild(itemDiv);
    });
}

document.addEventListener('DOMContentLoaded', function() {
// Event listener for type and maker filters
document.getElementById('typeFilter').addEventListener('change', filterItems);
document.getElementById('makerFilter').addEventListener('change', filterItems);

// Event listener for search input
    // Ensure the element exists before trying to add an event listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterItems);
    } else {
        console.error('Element with ID "searchInput" not found.');
    }

    // Call filterItems initially to populate the list
    filterItems();

    // Обработчики для других элементов...

    const minSpeedSlider = document.getElementById('minSpeed');
    const maxSpeedSlider = document.getElementById('maxSpeed');
    const minSpeedValue = document.getElementById('minSpeedValue');
    const maxSpeedValue = document.getElementById('maxSpeedValue');

    minSpeedSlider.addEventListener('input', function() {
        minSpeedValue.value = this.value;
        filterItems(); // Обновляем список элементов при изменении значения
    });

    maxSpeedSlider.addEventListener('input', function() {
        maxSpeedValue.value = this.value;
        filterItems(); // Обновляем список элементов при изменении значения
    });

    // Добавляем обработчики для элементов input type="number", чтобы синхронизировать их с ползунками
    minSpeedValue.addEventListener('input', function() {
        minSpeedSlider.value = this.value;
        filterItems(); // Обновляем список элементов при изменении значения
    });

    maxSpeedValue.addEventListener('input', function() {
        maxSpeedSlider.value = this.value;
        filterItems(); // Обновляем список элементов при изменении значения
    });
});

// Example of loading items and then calling filterItems
loadXML('/Printinvest/catalog/items/items.xml').then(() => {
    populateFilters(items); // Заполняем фильтры
    filterItems(); // Сортируем и отображаем эл������менты по имени

    // Находим минимальное и максимальное значения скорости печати
    const minSpeed = Math.min(...items.map(item => item.speed));
    const maxSpeed = Math.max(...items.map(item => item.speed));

    // Устанавливаем минимальное и максимальное значения для ползунков
    const minSpeedSlider = document.getElementById('minSpeed');
    const maxSpeedSlider = document.getElementById('maxSpeed');
    minSpeedSlider.min = minSpeed;
    minSpeedSlider.max = maxSpeed;
    maxSpeedSlider.min = minSpeed;
    maxSpeedSlider.max = maxSpeed;

    // Устанавливаем начальные значения и ограничения для элементов input type="number"
    minSpeedSlider.value = minSpeed;
    maxSpeedSlider.value = maxSpeed;
    minSpeedValue.min = minSpeed;
    minSpeedValue.max = maxSpeed;
    maxSpeedValue.min = minSpeed;
    maxSpeedValue.max = maxSpeed;
    minSpeedValue.value = minSpeed;
    maxSpeedValue.value = maxSpeed;
});

function filterItems() {
    const typeFilter = document.getElementById('typeFilter');
    const makerFilter = document.getElementById('makerFilter');
    const searchInput = document.getElementById('searchInput');
    const minSpeedSlider = document.getElementById('minSpeed');
    const maxSpeedSlider = document.getElementById('maxSpeed');

    // Get the selected type and maker, and the search text
    const selectedType = typeFilter.value;
    const selectedMaker = makerFilter.value;
    const searchText = searchInput.value.toLowerCase();
    const minSpeed = parseInt(minSpeedSlider.value, 10);
    const maxSpeed = parseInt(maxSpeedSlider.value, 10);

    // Filter, sort, and search items
    const filteredItems = items.filter(item => {
        const matchesType = !selectedType || item.type === selectedType;
        const matchesMaker = !selectedMaker || item.maker === selectedMaker;
        const matchesSearch = !searchText || item.name.toLowerCase().includes(searchText);
        const matchesSpeed = item.speed >= minSpeed && item.speed <= maxSpeed;
        return matchesType && matchesMaker && matchesSearch && matchesSpeed;
    });

    // Sort items alphabetically by name
    const sortedItems = filteredItems.sort((a, b) => a.name.localeCompare(b.name));

    // Update the DOM with the filtered and sorted items
    addItemsToDOM(sortedItems);
}


function loadItemDetails(xmlPath, itemName) {
    loadXML(xmlPath)
        .then(items => {
            const item = items.find(item => item.name === itemName);
            if (item) {
                // Здесь к��д для отображения информации о продукте в item.html
                // Например, перенаправление на item.html �� параметрами в URL
                // Добавл��ем значение 'maker' в URL
                window.location.href = `/Printinvest/catalog/item.html?name=${encodeURIComponent(item.name)}`;
                //&img=${item.img}&about=${item.about}&type=${item.type}&maker=${item.maker}
            }
        })
        .catch(error => console.error('Ошибка при загрузке XML:', error));
}

// Функция для периодической проверки обновлений в items.xml
function checkForUpdates() {
    loadXML('/Printinvest/catalog/items/items.xml')
        .then(addItemsToDOM)
        .catch(error => console.error('Оши����ка при заг��узке XML:', error));
}


// Проверяем обновления при загрузке страницы и каждые 5 минут
checkForUpdates();

