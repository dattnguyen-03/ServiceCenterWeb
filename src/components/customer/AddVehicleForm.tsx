import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, DatePicker } from 'antd';
import { CarOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { vehicleService } from '../../services/vehicleService';
import { CreateVehicleRequest, EditVehicleRequest, VehicleResponse } from '../../types/api';
import { showSuccess, showError, showLoading, closeLoading } from '../../utils/sweetAlert';
import dayjs from 'dayjs';

interface AddVehicleFormProps {
  initialData?: VehicleResponse;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AddVehicleForm: React.FC<AddVehicleFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;

  // Set initial values when editing
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        model: initialData.model,
        vin: initialData.vin,
        licensePlate: initialData.licensePlate,
        year: initialData.year,
        notes: initialData.notes,
        lastServiceDate: initialData.lastServiceDate ? dayjs(initialData.lastServiceDate) : undefined,
        nextServiceDate: initialData.nextServiceDate ? dayjs(initialData.nextServiceDate) : undefined,
        odometer: initialData.odometer || 0,
        lastServiceOdometer: initialData.lastServiceOdometer || 0,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Validate data
      const errors = vehicleService.validateVehicleData(values);
      if (errors.length > 0) {
        showError('Dữ liệu không hợp lệ', errors.join(', '));
        return;
      }

      if (isEditing && initialData) {
        // Edit existing vehicle
        const editData: EditVehicleRequest = {
          vehicleID: initialData.vehicleID,
          model: values.model,
          vin: values.vin,
          licensePlate: values.licensePlate,
          year: values.year,
          notes: values.notes,
          lastServiceDate: values.lastServiceDate ? values.lastServiceDate.format('YYYY-MM-DD') : undefined,
          nextServiceDate: values.nextServiceDate ? values.nextServiceDate.format('YYYY-MM-DD') : undefined,
          odometer: values.odometer || 0,
        };

        const response = await vehicleService.editVehicle(editData);
        
        if (response.success) {
          showSuccess('Cập nhật xe thành công!');
          onSuccess?.();
        } else {
          showError('Lỗi cập nhật xe', response.message || 'Có lỗi xảy ra khi cập nhật xe');
        }
      } else {
        // Create new vehicle
        const createData: CreateVehicleRequest = {
          model: values.model,
          vin: values.vin,
          licensePlate: values.licensePlate,
          year: values.year,
          notes: values.notes,
          lastServiceDate: values.lastServiceDate ? values.lastServiceDate.format('YYYY-MM-DD') : undefined,
          odometer: values.odometer || 0,
          lastServiceOdometer: values.lastServiceOdometer || 0,
        };

        console.log('Sending create data:', createData);
        const response = await vehicleService.createVehicle(createData);
        
        if (response.success) {
          showSuccess('Thêm xe thành công!');
          form.resetFields();
          onSuccess?.(); // This will close the modal
        } else {
          showError('Lỗi thêm xe', response.message || 'Có lỗi xảy ra khi thêm xe');
        }
      }
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'editing' : 'creating'} vehicle:`, error);
      showError(
        `Lỗi ${isEditing ? 'cập nhật' : 'thêm'} xe`, 
        error.message || `Có lỗi xảy ra khi ${isEditing ? 'cập nhật' : 'thêm'} xe`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel?.();
  };

  return (
    <Card 
      title={
        <div className="flex items-center">
          <CarOutlined className="mr-2 text-blue-500" />
          <span>{isEditing ? 'Chỉnh sửa xe' : 'Thêm xe mới'}</span>
        </div>
      }
      className="w-full max-w-2xl mx-auto"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          year: new Date().getFullYear(),
          odometer: 0,
          lastServiceOdometer: 0,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Model xe"
            name="model"
            rules={[
              { required: true, message: 'Vui lòng nhập model xe' },
              { min: 2, message: 'Model xe phải có ít nhất 2 ký tự' },
              { max: 100, message: 'Model xe không được vượt quá 100 ký tự' },
              { 
                pattern: /^[a-zA-Z0-9\s\-\.]+$/, 
                message: 'Model xe chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu chấm' 
              }
            ]}
          >
            <Input 
              placeholder="VD: Tesla Model Y, VinFast VF8" 
              size="large"
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            label="Năm sản xuất"
            name="year"
            rules={[
              { required: true, message: 'Vui lòng nhập năm sản xuất' },
              { type: 'number', min: 1900, max: new Date().getFullYear() + 1, message: 'Năm sản xuất không hợp lệ' }
            ]}
          >
            <InputNumber 
              placeholder="2024" 
              size="large"
              className="w-full"
              min={1900}
              max={new Date().getFullYear() + 1}
            />
          </Form.Item>

          <Form.Item
            label="VIN (Vehicle Identification Number)"
            name="vin"
            // rules={[
            //   { required: true, message: 'Vui lòng nhập VIN' },
            //   { min: 17, message: 'VIN phải có đúng 17 ký tự' },
            //   { max: 17, message: 'VIN phải có đúng 17 ký tự' },
            //   { 
            //     pattern: /^[A-HJ-NPR-Z0-9]{17}$/i, 
            //     message: 'VIN phải có đúng 17 ký tự và không chứa các ký tự I, O, Q' 
            //   }
            // ]}
          >
            <Input 
              placeholder="Nhập VIN của xe " 
              size="large"
              maxLength={17}
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>

          <Form.Item
            label="Biển số xe"
            name="licensePlate"
            rules={[
              { required: true, message: 'Vui lòng nhập biển số xe' },
              { min: 4, message: 'Biển số xe phải có ít nhất 4 ký tự' },
              { max: 20, message: 'Biển số xe không được vượt quá 20 ký tự' },
              { 
                pattern: /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/, 
                message: 'Biển số xe đã tồn tại' 
              }
            ]}
          >
            <Input 
              placeholder="VD: 30A-12345" 
              size="large"
              maxLength={20}
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>

          <Form.Item
            label="Odometer hiện tại (km)"
            name="odometer"
            rules={[
              { required: true, message: 'Vui lòng nhập chỉ số Odometer' },
              { type: 'number', min: 0, message: 'Odometer phải lớn hơn hoặc bằng 0' }
            ]}
          >
            <InputNumber 
              placeholder="Nhập số km hiện tại" 
              size="large"
              className="w-full"
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          {!isEditing && (
            <Form.Item
              label="Odometer lần bảo dưỡng cuối (km)"
              name="lastServiceOdometer"
              dependencies={['odometer']}
              rules={[
                { required: true, message: 'Vui lòng nhập Odometer lần bảo dưỡng cuối' },
                { type: 'number', min: 0, message: 'Odometer phải lớn hơn hoặc bằng 0' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const odometer = getFieldValue('odometer');
                    if (!value || !odometer || odometer >= value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Odometer hiện tại phải lớn hơn hoặc bằng Odometer lần bảo dưỡng cuối'));
                  },
                }),
              ]}
            >
              <InputNumber 
                placeholder="Nhập số km lần bảo dưỡng cuối" 
                size="large"
                className="w-full"
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Ngày bảo dưỡng cuối cùng"
            name="lastServiceDate"
          >
            <DatePicker 
              placeholder="Chọn ngày bảo dưỡng cuối cùng"
              size="large"
              className="w-full"
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>

          <Form.Item
            label="Ghi chú"
            name="notes"
            rules={[
              { max: 500, message: 'Ghi chú không được vượt quá 500 ký tự' }
            ]}
          >
            <Input.TextArea 
              placeholder="Ghi chú về xe (tùy chọn)"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            size="large"
            onClick={handleCancel}
            icon={<CloseOutlined />}
          >
            Hủy
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            size="large"
            icon={<SaveOutlined />}
            className="!bg-blue-600 hover:!bg-blue-700"
          >
            {loading ? (isEditing ? 'Đang cập nhật...' : 'Đang thêm...') : (isEditing ? 'Cập nhật xe' : 'Thêm xe')}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default AddVehicleForm;
