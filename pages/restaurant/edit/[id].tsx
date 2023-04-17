import Link from 'next/link';
import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { Page } from '@/types/Page';
import { useRouter } from 'next/router';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import useSwr from 'swr';
import { GripFoodBackEndClient, Restaurant } from '@/functions/swagger/GripFoodBackEnd';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitButton } from '@/components/SubmitButton';
import { InputText } from '@/components/FormControl';
import { notification } from 'antd';

const FormSchema = z.object({
    name: z.string().nonempty({
        message: 'Nama tidak boleh kosong'
    })
});

type FormDataType = z.infer<typeof FormSchema>;

const EditForm: React.FC<{
    id: string,
    name: string,
    onEdit: () => void
}> = ({ id, name, onEdit }) => {

    const {
        handleSubmit,
        register,
        formState: { errors },
        reset
    } = useForm<FormDataType>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: name
        }
    });

    async function onSubmit(data: FormDataType) {
        try {
            const client = new GripFoodBackEndClient('http://localhost:3000/api/be');
            await client.updateRestaurant(id, {
                name: data.name
            });
            reset({
                name: data.name
            });
            onEdit();
            notification.success({
                message: 'Success',
                description: 'Successfully edited province data',
                placement: 'bottomRight',
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label htmlFor='name'>Name</label>
                <InputText id='name' {...register('name')}></InputText>
                <p className='text-red-500'>{errors['name']?.message}</p>
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

    const fetcher = useSwrFetcherWithAccessToken();
    const restaurantDetailUri = id ? `/api/be/api/Restaurant/${id}` : undefined;
    const { data, mutate } = useSwr<Restaurant>(restaurantDetailUri, fetcher);

    function renderForm() {
        if (!id) {
            return;
        }

        if (typeof id !== 'string') {
            return;
        }

        const name = data?.name;
        if (!name) {
            return;
        }

        return (
            <EditForm id={id} name={name} onEdit={() => mutate()}></EditForm>
        );
    }

    return (
        <div>
            <Title>Edit Restaurant Data</Title>
            <Link href='/restaurant'>Return to Index</Link>

            <h2 className='mb-5 text-3xl'>Edit Restaurant Data</h2>
            {renderForm()}
        </div>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;