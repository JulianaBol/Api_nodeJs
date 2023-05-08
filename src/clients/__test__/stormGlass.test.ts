import StormGlass from '@src/clients/stormGlass';
import axios from 'axios';
import stormGlassWheather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json'

jest.mock('axios');

describe('StormGlass Client', () => {
  //atribui os tipos do jest e do axios ao mock
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  test('Deve retornar a previsão normalizada do serviço StormGlass', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    
    mockedAxios.get.mockResolvedValue({data:stormGlassWheather3HoursFixture});

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual(stormGlassNormalized3HoursFixture);
  });

  test('Deve excluir pontos de dados incompletos', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    const incompleteResponse = 
    {
      hours:
      [
        {
          windDirection:
          {
            noaa: 300,
          },
          time: '2020-04-26T00:00:00+00:00',
        },
      ]
    }
    
    mockedAxios.get.mockResolvedValue({data:incompleteResponse});

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  test('Deve receber um erro genérico do serviço StormGlass quando a solicitação falha antes de chegar ao serviço', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mockedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });
});
