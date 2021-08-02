const queryButton = document.querySelector('#queryButton');
const startDateInput = document.querySelector('#startDateInput');
const endDateInput = document.querySelector('#endDateInput');

const ctx = document.getElementById('chartCanvas').getContext('2d');

queryButton.addEventListener('click', (evt) => {
    evt.preventDefault();

    // only call update if end date is after start date
    if (endDateInput.valueAsNumber >= startDateInput.valueAsNumber) update();
    else alert("End date mustn't be before start date.")
});

async function update() {

    // Send Query to server for specific ranges

    queryButton.disabled = 'true';
    const [timestamps, occupations] = await queryServer();
    
    updateTable(timestamps, occupations);
    
    queryButton.disabled = undefined;
}

async function queryServer() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    const data = 
        fetch(`https://jonas-milkovits.com/gym-occupation?startDate=${startDate}&endDate=${endDate}`)
        .then(data => {
            return data.JSON();
        })
        .then(parsedData => {
            return parsedData;
        });
    
    // Data will look like this:
    // {
    //     timestamps: [
    //         1646549466,
    //         1578746498,
    //     ],
    //     occupations: [
    //         25,
    //         35,
    //     ]
    // }

    return [data.timestamps, data.occupations];
}

function updateTable (timestamps, occupations) {
    let chartCanvas = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [1,2,3,4,5],
            datasets: [{
                label: 'Occupation in Gym',
                data: [1,2,3,4,5],
                backgroundColor: [
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

}

function setTodaysDate() {
    // Set default value for date inputs to today's date

    let dateToday = new Date(Date.now());

    let year = dateToday.getFullYear();
    let month = dateToday.getMonth() + 1;

    month = month < 10 ? '0' + month : month;
    let day = dateToday.getDate();
    day = day < 10 ? '0' + day : day;

    let dateString = `${year}-${month}-${day}`;

    startDateInput.value = dateString;
    endDateInput.value = dateString;
}

setTodaysDate();