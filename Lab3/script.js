const app = document.createElement('div'); //створюю дів -- застосунок
document.body.appendChild(app); //додавання застосунку в тіло

//загальні стилі застосунку
app.style.width = '320px';
app.style.margin = '50px auto';
app.style.padding = '20px';
app.style.borderRadius = '30px';
app.style.background = '#000';
app.style.boxShadow = '0 4px 30px rgba(0,0,0,0.5)';
app.style.display = 'flex';
app.style.flexDirection = 'column';
app.style.gap = '10px';

//екран
const display = document.createElement('input');
display.type = 'text';
display.readOnly = true;
app.appendChild(display);

//стилі екрану
display.style.height = '60px';
display.style.fontSize = '32px';
display.style.textAlign = 'right';
display.style.padding = '10px';
display.style.border = 'none';
display.style.borderRadius = '10px';
display.style.background = '#333';
display.style.color = '#fff';
display.style.marginBottom = '10px';


const buttons = [
    ['AC', '+/-', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
];

//створення кнопок 
buttons.forEach(row => {
    const rowDiv = document.createElement('div'); //контейнери для кожного ряду кнопок
    rowDiv.style.display = 'flex';
    rowDiv.style.gap = '10px';
    app.appendChild(rowDiv);

    row.forEach(btnText => {
        const button = document.createElement('button');
        button.textContent = btnText;
        rowDiv.appendChild(button);

        //стилі для кнопок
        button.style.flex = btnText === '0' ? '2' : '1';
        button.style.height = '60px';
        button.style.fontSize = '24px';
        button.style.border = 'none';
        button.style.borderRadius = '30px';
        button.style.background = ['/', '*', '-', '+', '='].includes(btnText) ? '#ff9500' : '#505050';
        button.style.color = ['/', '*', '-', '+', '='].includes(btnText) ? '#fff' : '#fff';

        // логіка
        button.addEventListener('click', () => {
            if (btnText === 'AC') {
                display.value = '';
            } else if (btnText === '=') {
                try {
                    display.value = eval(display.value.replace('÷', '/').replace('×', '*'));
                } catch {
                    display.value = 'Error';
                }
            } else if (btnText === '+/-') {
                if (display.value) {
                    display.value = String(-parseFloat(display.value));
                }
            } else {
                display.value += btnText;
            }
        });
    });
});
