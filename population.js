const Promise = require('bluebird');
const axios = require('axios');

let req = [];

let populationCanada = "http://api.population.io:80/1.0/population/2017/Canada/";
let populationGermany = "http://api.population.io:80/1.0/population/2017/Germany/";
let populationFrance = "http://api.population.io:80/1.0/population/2017/France/";
let populationBelarus2015 = "http://api.population.io:80/1.0/population/2015/Belarus/";
let populationBelarus2016 = "http://api.population.io:80/1.0/population/2016/Belarus/";

axios.get('http://api.population.io:80/1.0/population/2017/Belarus/')
    .then(function (response) {
        if (response.data.length > 0) {
            let total = 0;
            for (let i = 0; i < response.data.length; i++){
                total += response.data[i].total;
            }
            console.log();
            console.log('Население: ' + total);
        }
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    });

req.push(axios.get(populationCanada));
req.push(axios.get(populationGermany));
req.push(axios.get(populationFrance));

Promise.all(req)
    .then((results) => {
        console.log();
        console.log("Promise.all");
        results.forEach((obj) => {
            let total = 0;
            obj.data.forEach((ageGroup) => {
                total += ageGroup.total;
            });
            console.log(total);
        });
    })
    .catch((err) => {

        console.error("Promise.all ERROR " + err);
    });


Promise.any([axios.get(populationBelarus2015), axios.get(populationBelarus2016)]).then((results) => {
    let total = 0;
    console.log();
    console.log("Promise.any");
    results.data.forEach((ageGroup) => {
        if (ageGroup.age === 25)
            total += ageGroup.total;
    });
    console.log(total);
}).catch((error) => {
    console.error("Promise.any ERROR " + error);
});

let population = axios.create({
    baseURL: 'http://api.population.io:80/1.0/mortality-distribution/',
});

let urlsGreece = [];
let urlsTurkey= [];

urlsGreece.push(`Greece/male/0/today/`);
urlsTurkey.push(`Turkey/male/0/today/`);
urlsGreece.push(`Greece/female/0/today/`);
urlsTurkey.push(`Turkey/female/0/today/`);


Promise.props({
    greece: Promise.all(urlsGreece.map(population.get)),
    turkey: Promise.all(urlsTurkey.map(population.get))
})
    .then(result=>
        {
            let maxGreece = 0;
            let maxTurkey = 0;
            let maxMortAgeGreece = 0;
            let maxMortAgeTurkey = 0;
            for(let j = 0; j < 2; j++)
            {
                for(let iter = 0; iter < result.greece[j].data.mortality_distribution.length; iter++)
                {
                    if (result.greece[j].data.mortality_distribution[iter].mortality_percent > maxGreece)
                    {
                        maxGreece = result.greece[j].data.mortality_distribution[iter].mortality_percent;
                        maxMortAgeGreece = result.greece[j].data.mortality_distribution[iter].age;
                    }
                }
                for(let iter = 0; iter < result.turkey[j].data.mortality_distribution.length; iter++)
                {
                    if (result.turkey[j].data.mortality_distribution[iter].mortality_percent > maxTurkey)
                    {
                        maxTurkey = result.turkey[j].data.mortality_distribution[iter].mortality_percent;
                        maxMortAgeTurkey = result.turkey[j].data.mortality_distribution[iter].age;
                    }
                }
                console.log();
                console.log("Promise.props");
                console.log("Греция ");
                console.log(maxMortAgeGreece);
                console.log("Турция ");
                console.log(maxMortAgeTurkey);
            }


        }
    );