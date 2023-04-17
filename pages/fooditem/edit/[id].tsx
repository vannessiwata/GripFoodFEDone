import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { Page } from '@/types/Page';
import { z } from 'zod';
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitButton } from '@/components/SubmitButton';
import { GripFoodBackEndClient, FoodItemDetailModel, Restaurant } from '@/functions/swagger/GripFoodBackEnd';
import Link from 'next/link';
import { InputText } from '@/components/FormControl';
import { Select, Spin, notification } from 'antd';
import { useState } from 'react';
import useSwr from 'swr';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';

// C- Create
// R- Read
// U- Update
// D- Delete

const FormSchema = z.object({
    name: z.string().nonempty({
        message: 'Nama tidak boleh kosong'
    }),
    restaurantId: z.string().nonempty({
        message: 'Restaurant tidak boleh kosong'
    }),
    price: z.number({
        invalid_type_error: 'Harga tidak boleh kosong dan harus angka'
    }).nonnegative({
        message: 'Harga tidak boleh negatif'
    })
        .max(100000000, "Harga tidak dapat lebih dari 100 juta rupiah")
        .min(100, "Angka tidak dapat kurang dari 100 rupiah"),
});
type FormDataType = z.infer<typeof FormSchema>;

const EditForm: React.FC<{
    id: string,
    foodItem: FoodItemDetailModel,
    onEdited: () => void,
}> = ({ id, foodItem, onEdited }) => {

    const {
        handleSubmit,
        register,
        formState: { errors },
        reset,
        control
    } = useForm<FormDataType>({
        defaultValues: {
            name: foodItem.name,
            restaurantId: foodItem.restaurantId,
            price: foodItem.price
        },
        resolver: zodResolver(FormSchema)
    });

    async function onSubmit(data: FormDataType) {
        // console.log(data);

        try {
            const client = new GripFoodBackEndClient('http://localhost:3000/api/be');
            await client.updateFoodItem(id, {
                name: data.name,
                price: data.price,
                restaurantId: data.restaurantId,
            });
            reset(data);
            onEdited();
            notification.success({
                message: 'Success',
                description: 'Successfully edited product data',
                placement: 'bottomRight',
            });
        } catch (error) {
            console.error(error);
        }
    }

    const [search, setSearch] = useState('');
    const params = new URLSearchParams();
    params.append('search', search);
    const restaurantsUri = '/api/be/api/Restaurant?' + params.toString();
    const fetcher = useSwrFetcherWithAccessToken();
    const { data, isLoading, isValidating } = useSwr<Restaurant[]>(restaurantsUri, fetcher);

    const setSearchDebounced = debounce((t: string) => setSearch(t), 300);

    const options = data?.map(Q => {
        return {
            label: Q.name,
            value: Q.id
        };
    }) ?? [{
        label: foodItem.restaurantName,
        value: foodItem.restaurantId
    }];

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label htmlFor='name'>Name</label>
                <InputText id='name' {...register('name')}></InputText>
                <p className='text-red-500'>{errors['name']?.message}</p>
            </div>
            <div>
                <label htmlFor='price'>Price</label>
                <InputText id='price'{...register('price', { valueAsNumber: true })}></InputText>
                <p className='text-red-500'>{errors['price']?.message}</p>
            </div>
            <div className='mt-5'>
                <label htmlFor='restaurant'>Restaurant</label>
                <Controller
                    control={control}
                    name='restaurantId'
                    render={({ field }) => (
                        <Select
                            className='block'
                            showSearch
                            optionFilterProp="children"
                            {...field}
                            onSearch={t => setSearchDebounced(t)}
                            options={options}
                            filterOption={false}
                            notFoundContent={(isLoading || isValidating) ? <Spin size="small" /> : null}
                        />
                    )}
                ></Controller>

                <p className='text-red-500'>{errors['restaurantId']?.message}</p>
            </div>
            <div className='mt-5'>
                <SubmitButton>Submit</SubmitButton>
            </div>
        </form>
    );
};

const IndexPage: Page = () => {

    const router = useRouter();
    const { id } = router.query;
    const productDetailUri = id ? `/api/be/api/FoodItems/${id}` : undefined;
    const fetcher = useSwrFetcherWithAccessToken();
    const { data, mutate } = useSwr<FoodItemDetailModel>(productDetailUri, fetcher);

    function renderForm() {
        if (!id || !data || typeof id !== 'string') {
            return;
        }

        return (
            <EditForm id={id} foodItem={data} onEdited={() => mutate()}></EditForm>
        );
    }

    return (
        <div>
            <Title>Edit Food Item Data</Title>
            <Link href='/fooditem'>Return to Index</Link>

            <h2 className='mb-5 text-3xl'>Edit Food Item Data</h2>
            {renderForm()}
        </div>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;