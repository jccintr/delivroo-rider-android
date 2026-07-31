import { BASE_API } from '../constants/api';

/*
export const login = async (email, password) => {
    try {
        const response = await fetch(`${BASE_API}/riders/login`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        });
        return response;

    } catch (error) {
        console.log(error);
    }
   
};
  */      
export const getRadios = async () => {
    try {
        // java api
        const response = await fetch('https://radios-api-production.up.railway.app/radios/all', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
           
        });
        return response;

    } catch (error) {
        console.log(error);
    }
   
};
