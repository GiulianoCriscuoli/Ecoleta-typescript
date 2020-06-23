import React , { useEffect, useState, ChangeEvent } from 'react';
import { Link, useHistory} from  'react-router-dom';
import './style.css';
import logo from '../../assets/logo.svg';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import  {LeafletMouseEvent} from 'leaflet';
import Dropzone from '../../components/Dropzone';
interface item {

    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {

    sigla: string;
}

interface IBGECityResponse {

    nome: string;
}

const CreatePoint = () => {

    const [items, setItems] = useState<item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [selectedUf, setSelectedUf] = useState('0');
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [inputData, setInputData] = useState({

        name: '',
        email: '',
        whatsapp: '',

    });
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const history = useHistory();

    useEffect(() =>{

        navigator.geolocation.getCurrentPosition(position => {

            const {latitude, longitude} = position.coords;

            setInitialPosition([latitude, longitude]);
        })

    })

    useEffect(() => {

        api.get('items').then(response => {

            setItems(response.data);

            

        });
    }, []);

    useEffect( () => {

        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response =>{

            const ufInitials = response.data.map(uf => uf.sigla);

            setUfs(ufInitials);

        });

    }, []);

    useEffect(() => {

        if(selectedUf === '0') {

            return;
        }

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response =>{

            const cityNames = response.data.map(city => city.nome);

            setCities(cityNames);

        });


    }, [selectedUf]);

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {

        const uf = event.target.value;

        setSelectedUf(uf);
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {

        const city = event.target.value;

        setSelectedCity(city);
        
    }

    function handleMapClick(event:LeafletMouseEvent ) {
        setSelectedPosition([

        event.latlng.lat,
        event.latlng.lng
            
        ])
    

    }

    function handleSelectItem(id: number) {

        const alreadySelected = selectedItems.findIndex(item => item === id);

        if(alreadySelected >= 0) {

            const filteredItems = selectedItems.filter(item => item !== id );

            setSelectedItems(filteredItems);
        } else {

            setSelectedItems([ ...selectedItems, id]);
        }

    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {

        const { name, value } = event.target;

        setInputData({...inputData, [name]: value});
    }

    async function handleSubmit() {
        const { name, email, whatsapp} = inputData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {

            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        };

        await api.post('points', data);

        alert('Ponto de coleta criado!');

        history.push('/');

    }
    

    return(
        <div id="page-create-point">

            <header>
                <img src={logo} alt="Ecoleta" />

                <Link to="/">
                <FiArrowLeft />

                 Voltar para home

                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do<br /> ponto de coleta</h1>

                <Dropzone />


                    <fieldset>

                        <legend>
                            <h2>Dados</h2>
                        </legend>

                        <div className="field">
                            <label htmlFor="name">Nome da Entidade</label>
                            <input type="text" name="name" id="name" onChange={handleInputChange} />
                        </div>

                        <div className="field-group">

                            <div className="field">

                            <label htmlFor="email">E-mail</label>
                            <input type="text" name="name" id="name" onChange={handleInputChange} />

                            </div>

                            <div className="field">

                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />

                            </div>
                
                        </div>

                    </fieldset>

                     <fieldset>

                        <legend>
                            <h2>Dados</h2>
                        </legend>

                    </fieldset>

                    <fieldset>

                        <legend>
                            <h2>Endereço</h2>
                            <span>Selecione o endereço do mapa</span>
                        </legend>

                        <Map center={initialPosition} zoom={15} onclick={handleMapClick}>

                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            <Marker position={selectedPosition}/>
                            
                        </Map>

                    <div className="field-group">

                        <div className="field">

                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (

                                <option  key={uf} value={uf}>{uf}</option>

                                ))}

                            </select>

                        </div>

                        <div className="field">

                        <label htmlFor="city">Cidade</label>

                        <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>

                            <option value="0">Selecione uma cidade</option>

                            {cities.map(cities => (

                            <option  key={cities} value={cities}>{cities}</option>

                            ))}


                        </select>

                        </div>

                    </div>

                    </fieldset>

                    <fieldset>

                        <legend>
                            <h2>Itens de coleta</h2>
                            <span>Selecione um ou mais itens abaixo</span>
                        </legend>

                        <ul className="items-grid">
                            {items.map(item => (

                                 <li  key={item.id} onClick={() => handleSelectItem(item.id)}
                                 className={selectedItems.includes(item.id) ? 'selected': ''}>
                                 <img src={item.image_url} alt={item.title}/>
                                 <span>{item.title}</span>
                                 </li>

                            ))};

                           
                        </ul>

                    </fieldset>

                    <button type="submit">Cadastrar ponto de coleta</button>

            </form>

        </div>
    );
};

export default CreatePoint;