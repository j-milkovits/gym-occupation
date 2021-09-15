const queryButton = document.querySelector('#queryButton');
const startDateInput = document.querySelector('#startDateInput');
const endDateInput = document.querySelector('#endDateInput');

const ctx = document.getElementById('chartCanvas').getContext('2d');
let chartCanvas;

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

    chartCanvas && chartCanvas.destroy();
    updateTable(timestamps, occupations);

    queryButton.disabled = undefined;
}

async function queryServer() {
    const startDate = startDateInput.valueAsNumber;
    const endDate = endDateInput.valueAsNumber;

    const fetchedData = await fetch(`https://jonas-milkovits.com/gym-occupation/api?startDate=${startDate}&endDate=${endDate}`);
    const data = await fetchedData.json();


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
    timestamps = timestamps.map(convertTimestamp);

    chartCanvas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Occupation of gym in %',
                data: occupations,
                backgroundColor: "rgba(255, 255, 255, 1)",
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
        }
    });

}

function convertTimestamp(timestamp) {
    let date = new Date(timestamp);
    let dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long'}).format(date);
    let day = date.getDate();
    day = day < 10 ? '0' + day : day;
    let month = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    let year = date.getFullYear();
    let hour = date.getHours();
    hour = hour < 10 ? '0' + hour : hour;
    let minutes = date.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;

    // let dateString = `${dayOfWeek} - ${hour}:${minutes} - ${day}/${month}/${year}`;
    let dateString = `${day}/${month} - ${hour}:${minutes}`;

    return dateString;
}

// Not setting TodaysDate to inputs anymore, because data was only collected up to 2021/08/21

// function setTodaysDate() {
//     // Set default value for date inputs to today's date

//     let dateToday = new Date(Date.now());

//     let year = dateToday.getFullYear();
//     let month = dateToday.getMonth() + 1;

//     month = month < 10 ? '0' + month : month;
//     let day = dateToday.getDate();
//     day = day < 10 ? '0' + day : day;

//     let dateString = `${year}-${month}-${day}`;

//     startDateInput.value = dateString;
//     endDateInput.value = dateString;
// }

// setTodaysDate(); 

update();