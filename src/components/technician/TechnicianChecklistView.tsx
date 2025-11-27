import React, { useState, useEffect } from "react";
import { Table, Card, Input, Tag, Modal, Descriptions, Statistic, Button, Form, Select, Tooltip, Checkbox } from "antd";
import { FileTextOutlined, SearchOutlined, EyeOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { serviceChecklistService, ServiceChecklistGroup, ChecklistItem, EditServiceChecklistRequest } from "../../services/serviceChecklistService";
import { serviceOrderService, ServiceOrder } from "../../services/serviceOrderService";
import { message } from "antd";
import { httpClient } from "../../services/httpClient";

interface Category {
  categoryID: number;
  name: string;
  description: string;
}

const TechnicianChecklistView: React.FC = () => {
  const [checklists, setChecklists] = useState<ServiceChecklistGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<ServiceChecklistGroup | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<ChecklistItem | null>(null);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createFormValid, setCreateFormValid] = useState(false);
  const [selectedOrderCategories, setSelectedOrderCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categoryStatuses, setCategoryStatuses] = useState<{[key: number]: string}>({});

  useEffect(() => {
    fetchChecklists();
    fetchServiceOrders();
  }, []);

  // Validate form khi modal mở
  useEffect(() => {
    if (isCreateModalVisible) {
      setCreateFormValid(false);
      form.resetFields();
    }
  }, [isCreateModalVisible]);

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      const data = await serviceChecklistService.getMyChecklists();
      setChecklists(data);
      
      // Only show message if it's a real error, not just no data
      if (data.length === 0) {
        console.log("No checklists found - this is normal");
      }
    } catch (err: any) {
      console.error("Error fetching checklists:", err);
      // Only show error for actual errors, not "no data" cases
      if (!err.message.includes('chưa có checklist nào')) {
        message.error("Không thể tải danh sách checklist của bạn");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceOrders = async () => {
    setLoadingOrders(true);
    try {
      const orders = await serviceOrderService.getMyServiceOrders();
      setServiceOrders(orders);
    } catch (err: any) {
      console.error("Error fetching service orders:", err);
      // Không hiển thị error vì có thể technician chưa có order nào
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadCategoriesFromOrder = async (orderId: number) => {
    console.log('=== LOADING CATEGORIES FOR ORDER:', orderId);
    setLoadingCategories(true);
    
    try {
      // Tìm order được chọn
      const selectedOrder = serviceOrders.find(order => (order.OrderID || order.orderID) === orderId);
      console.log('Selected order:', selectedOrder);
      
      if (!selectedOrder) {
        console.log('Order not found');
        setSelectedOrderCategories([]);
        return;
      }

      // Extract serviceType từ order
      const serviceType = selectedOrder.serviceType;
      console.log('ServiceType:', serviceType);
      
      if (!serviceType) {
        console.log('No serviceType found in order');
        setSelectedOrderCategories([]);
        message.warning('Order này không có thông tin loại dịch vụ');
        return;
      }

      // Call API để lấy tất cả service packages
      console.log('Calling GetServicePackageAPI...');
      const response = await httpClient.get('/GetServicePackageAPI');
      console.log('Service packages response:', response);
      
      // Tìm package có tên match với serviceType
      const packages = Array.isArray(response) ? response : (response.data || []);
      console.log('All packages:', packages);
      
      const targetPackage = packages.find((pkg: any) => 
        pkg.name === serviceType || 
        pkg.packageName === serviceType ||
        pkg.title === serviceType
      );
      
      console.log('Target package found:', targetPackage);
      
      if (targetPackage && targetPackage.categories && targetPackage.categories.length > 0) {
        // Map categories từ service package format
        const mappedCategories = targetPackage.categories.map((cat: any) => ({
          categoryID: cat.categoryID || cat.CategoryID || cat.id,
          name: cat.name || cat.Name || cat.title,
          description: cat.description || cat.Description || 'Không có mô tả'
        }));
        
        console.log('Categories found from package:', mappedCategories);
        setSelectedOrderCategories(mappedCategories);
        
        // Auto-select all categories by default
        const allCategoryIds = mappedCategories.map((cat: Category) => cat.categoryID);
        setSelectedCategories(allCategoryIds);
        form.setFieldsValue({ categories: allCategoryIds });
        
        // Set default status 'OK' for all categories
        const defaultStatuses: {[key: number]: string} = {};
        allCategoryIds.forEach((id: number) => {
          defaultStatuses[id] = 'OK';
        });
        setCategoryStatuses(defaultStatuses);
        
        // Trigger form validation
        setTimeout(() => {
          const formValues = form.getFieldsValue();
          const isValid = !!formValues.orderID && 
                        formValues.categories && 
                        formValues.categories.length > 0 && 
                        !!formValues.status;
          setCreateFormValid(isValid);
        }, 100);
        
        if (mappedCategories.length === 0) {
          message.info('Service package này chưa có categories được cấu hình');
        }
      } else {
        console.log('No matching package found or no categories in package');
        
        // Fallback categories dựa trên serviceType string khi không tìm thấy package
        let fallbackCategories = [];
        
        if (serviceType.toLowerCase().includes('bảo dưỡng') || serviceType.toLowerCase().includes('cơ bản')) {
          fallbackCategories = [
            { categoryID: 1, name: 'Bảo dưỡng cơ bản', description: 'Kiểm tra tổng quát xe' },
            { categoryID: 2, name: 'Thay dầu động cơ', description: 'Thay dầu và lọc dầu' },
            { categoryID: 3, name: 'Kiểm tra lốp xe', description: 'Kiểm tra áp suất và độ mòn lốp' }
          ];
        } else if (serviceType.toLowerCase().includes('toàn diện') || serviceType.toLowerCase().includes('cao cấp')) {
          fallbackCategories = [
            { categoryID: 4, name: 'Bảo dưỡng toàn diện', description: 'Kiểm tra và bảo dưỡng chi tiết' },
            { categoryID: 5, name: 'Thay phụ tùng', description: 'Thay thế các bộ phận hư hỏng' },
            { categoryID: 6, name: 'Kiểm tra hệ thống điện', description: 'Kiểm tra mạch điện và cảm biến' },
            { categoryID: 7, name: 'Cân bằng động cơ', description: 'Cân chỉnh và hiệu chỉnh động cơ' }
          ];
        } else {
          // Default fallback
          fallbackCategories = [
            { categoryID: 11, name: 'Kiểm tra tổng quát', description: 'Kiểm tra tình trạng chung của xe' },
            { categoryID: 12, name: 'Bảo dưỡng định kỳ', description: 'Bảo dưỡng theo chu kỳ quy định' },
            { categoryID: 13, name: 'Kiểm tra an toàn', description: 'Đảm bảo các tiêu chuẩn an toàn' }
          ];
        }
        
        console.log('Using fallback categories for serviceType:', serviceType);
        setSelectedOrderCategories(fallbackCategories);
        
        // Auto-select all fallback categories
        const allCategoryIds = fallbackCategories.map((cat: Category) => cat.categoryID);
        setSelectedCategories(allCategoryIds);
        form.setFieldsValue({ categories: allCategoryIds });
        
        // Set default status 'OK' for all categories
        const defaultStatuses: {[key: number]: string} = {};
        allCategoryIds.forEach((id: number) => {
          defaultStatuses[id] = 'OK';
        });
        setCategoryStatuses(defaultStatuses);
        
        message.info(`Không tìm thấy package "${serviceType}" trong hệ thống, sử dụng categories mặc định`);
      }

    } catch (error: any) {
      console.error('Error loading categories:', error);
      console.error('Full error:', JSON.stringify(error, null, 2));
      
      // Fallback categories khi có lỗi API
      const errorFallbackCategories = [
        { categoryID: 1, name: 'Kiểm tra động cơ', description: 'Kiểm tra tình trạng động cơ' },
        { categoryID: 2, name: 'Thay lốp xe', description: 'Thay thế lốp xe mới' },
        { categoryID: 3, name: 'Bảo dưỡng định kỳ', description: 'Bảo dưỡng theo chu kỳ' }
      ];
      setSelectedOrderCategories(errorFallbackCategories);
      
      // Auto-select all error fallback categories
      const allCategoryIds = errorFallbackCategories.map((cat: Category) => cat.categoryID);
      setSelectedCategories(allCategoryIds);
      form.setFieldsValue({ categories: allCategoryIds });
      
      // Set default status 'OK' for all categories
      const defaultStatuses: {[key: number]: string} = {};
      allCategoryIds.forEach((id: number) => {
        defaultStatuses[id] = 'OK';
      });
      setCategoryStatuses(defaultStatuses);
      
      // Hiển thị warning message cho user
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        message.warning(`Lỗi khi tải service packages (${error.response.status}), sử dụng categories mặc định`);
      } else {
        message.warning('Không thể kết nối API, sử dụng categories mặc định');
      }
    } finally {
      setLoadingCategories(false);
      console.log('=== END LOADING CATEGORIES DEBUG ===');
    }
  };

  const handleViewDetail = (checklist: ServiceChecklistGroup) => {
    setSelectedChecklist(checklist);
    setIsDetailModalVisible(true);
  };

  const handleCreateChecklist = async (values: any) => {
    console.log('=== CREATE CHECKLIST DEBUG ===');
    console.log('Form values:', values);
    console.log('Categories type:', typeof values.categories);
    console.log('Categories value:', values.categories);
    
    // Validate: Kiểm tra xem Service Order đã hoàn tất chưa
    const selectedOrder = serviceOrders.find(
      order => (order.OrderID || order.orderID) === values.orderID
    );
    
    if (!selectedOrder) {
      message.error('Không tìm thấy Service Order!');
      return;
    }
    
    // Ensure categories is an array
    const categories = Array.isArray(values.categories) ? values.categories : [];
    console.log('Processed categories:', categories);
    
    if (categories.length === 0) {
      message.error('Vui lòng chọn ít nhất một danh mục!');
      return;
    }
    
    if (!values.status) {
      message.error('Vui lòng chọn trạng thái mặc định!');
      return;
    }
    
    const orderStatus = selectedOrder.status;
    
    // Kiểm tra nhiều cách viết của Completed
    const isCompleted = orderStatus === 'Completed';
    
    if (isCompleted) {
      console.error('BLOCKED: Trying to create checklist for completed order:', values.orderID);
      message.error('Không thể tạo checklist cho Service Order đã hoàn tất!');
      form.setFields([{ name: 'orderID', errors: ['Không thể chọn Service Order đã hoàn tất'] }]);
      return;
    }
    
    // Double check: đảm bảo order không có trong availableOrders nếu đã completed
    const isInAvailable = availableOrders.some(
      o => (o.OrderID || o.orderID) === values.orderID
    );
    if (!isInAvailable) {
      console.error('BLOCKED: Order not in availableOrders:', values.orderID);
      message.error('Service Order này không khả dụng để tạo checklist!');
      form.setFields([{ name: 'orderID', errors: ['Service Order này không khả dụng'] }]);
      return;
    }
    
    setLoading(true);
    try {
      console.log('=== CREATING CHECKLISTS ===');
      console.log('Processing categories:', categories);
      console.log('Categories count:', categories.length);
      console.log('Available categories:', selectedOrderCategories);
      console.log('Category statuses:', categoryStatuses);
      
      // Tạo checklist cho từng category được chọn
      const checklistsToCreate = categories.map((categoryID: number) => {
        const categoryInfo = selectedOrderCategories.find(cat => cat.categoryID === categoryID);
        // Sử dụng status riêng của category nếu có, không thì dùng status tổng
        const categoryStatus = categoryStatuses[categoryID] || values.status; 
        
        const checklistData = {
          orderID: values.orderID,
          itemName: categoryInfo?.name || `Category ${categoryID}`,
          status: categoryStatus,
          notes: values.notes || '' // Sử dụng notes chung
        };
        
        console.log(`Creating checklist for category ${categoryID}:`, checklistData);
        return checklistData;
      });
      
      console.log('Total checklists to create:', checklistsToCreate.length);
      console.log('Checklist data array:', checklistsToCreate);
      
      // Tạo từng checklist một cách tuần tự để track progress
      const results = [];
      for (let i = 0; i < checklistsToCreate.length; i++) {
        const checklistData = checklistsToCreate[i];
        console.log(`Creating checklist ${i + 1}/${checklistsToCreate.length}:`, checklistData);
        
        try {
          const result = await serviceChecklistService.createChecklist(checklistData);
          results.push(result);
          console.log(`Successfully created checklist ${i + 1}:`, result);
        } catch (error) {
          console.error(`Failed to create checklist ${i + 1}:`, error);
          throw error; // Re-throw để stop process
        }
      }
      
      console.log('All checklists created successfully:', results);
      
      const categoryCount = categories.length;
      message.success(`Tạo thành công ${categoryCount} checklist cho ${categoryCount} danh mục!`);
      setIsCreateModalVisible(false);
      form.resetFields();
      setCreateFormValid(false);
      setSelectedCategories([]);
      setSelectedOrderCategories([]);
      setCategoryStatuses({});
      await fetchChecklists();
    } catch (error: any) {
      message.error(error.message || 'Lỗi tạo checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChecklist = async (values: EditServiceChecklistRequest) => {
    if (!editingChecklist) return;
    
    const orderID = getEditOrderID();
    if (!orderID) {
      message.error('Không tìm thấy thông tin Order ID!');
      return;
    }
    
    // Validate: Nếu đổi sang order khác, kiểm tra order đó có completed chưa
    if (values.orderID !== orderID) {
      const selectedOrder = serviceOrders.find(
        order => (order.OrderID || order.orderID) === values.orderID
      );
      
      if (selectedOrder && selectedOrder.status === 'Completed') {
        message.error('Không thể chuyển checklist sang Service Order đã hoàn tất!');
        return;
      }
    }
    
    setLoading(true);
    try {
      await serviceChecklistService.editChecklist(editingChecklist.checklistID, values);
      message.success('Cập nhật checklist thành công!');
      setIsEditModalVisible(false);
      setEditingChecklist(null);
      editForm.resetFields();
      await fetchChecklists();
    } catch (error: any) {
      message.error(error.message || 'Lỗi cập nhật checklist');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get orderID from editingChecklist
  const getEditOrderID = () => {
    if (!editingChecklist) return null;
    // Find which group contains this checklist item
    const parentGroup = checklists.find(group => 
      group.checklistItems?.some(item => item.checklistID === editingChecklist.checklistID)
    );
    return parentGroup?.orderID || null;
  };


  const openEditModal = (checklist: ChecklistItem, orderID: number) => {
    setEditingChecklist(checklist);
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      orderID: orderID,
      itemName: checklist.itemName,
      status: checklist.status,
      notes: checklist.notes
    });
  };

  // Lọc các Service Orders chưa hoàn tất
  const availableOrders = serviceOrders.filter(order => {
    const status = order.status;
    const isNotCompleted = status !== 'Completed';
    if (!isNotCompleted) {
      console.log('Filtered out completed order:', order.OrderID || order.orderID, 'status:', status);
    }
    return isNotCompleted;
  });
  
  // Lấy danh sách orders cho Edit modal: bao gồm availableOrders + order hiện tại của checklist đang edit (nếu có)
  const getEditModalOrders = () => {
    if (!editingChecklist) return availableOrders;
    const orderID = getEditOrderID();
    if (!orderID) return availableOrders;
    
    const currentOrder = serviceOrders.find(
      order => (order.OrderID || order.orderID) === orderID
    );
    if (currentOrder && !availableOrders.find(o => (o.OrderID || o.orderID) === (currentOrder.OrderID || currentOrder.orderID))) {
      return [...availableOrders, currentOrder];
    }
    return availableOrders;
  };

  const filteredChecklists = checklists.filter((checklistGroup) => {
    if (!checklistGroup) return false;
    const search = searchText.toLowerCase();
    
    // Search in group info
    const groupMatch = (
      (checklistGroup.customerName || '').toLowerCase().includes(search) ||
      (checklistGroup.vehicleModel || '').toLowerCase().includes(search) ||
      (checklistGroup.centerName || '').toLowerCase().includes(search)
    );
    
    // Search in checklist items
    const itemsMatch = checklistGroup.checklistItems?.some(item => {
      const statusText = item.status === 'OK' ? 'ok' : 
                        item.status === 'NotOK' ? 'not ok' : 
                        item.status === 'NeedReplace' ? 'cần thay thế' : 
                        item.status?.toLowerCase() || '';
      return (
        (item.itemName || '').toLowerCase().includes(search) ||
        statusText.includes(search) ||
        (item.notes || '').toLowerCase().includes(search)
      );
    });
    
    return groupMatch || itemsMatch;
  });

  const columns: ColumnsType<ServiceChecklistGroup> = [
    {
      title: "Order ID",
      dataIndex: "orderID",
      key: "orderID",
      width: 100,
      render: (orderID) => <span style={{ fontWeight: 600, color: '#1f2937' }}>#{orderID}</span>
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 150,
      render: (text) => <span style={{ fontWeight: 600, color: '#1f2937' }}>{text}</span>
    },
    {
      title: "Xe",
      dataIndex: "vehicleModel",
      key: "vehicleModel",
      width: 150,
    },
    {
      title: "Trung tâm",
      dataIndex: "centerName",
      key: "centerName",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Danh sách hạng mục kiểm tra",
      key: "checklistItems",
      render: (_, record) => (
        <div style={{ maxWidth: 300 }}>
          {record.checklistItems?.map((item) => {
            const statusColor = 
              item.status === 'OK' ? 'green' :
              item.status === 'NotOK' ? 'red' :
              item.status === 'NeedReplace' ? 'orange' : 'default';
            const statusText = 
              item.status === 'OK' ? '✓ OK' :
              item.status === 'NotOK' ? '❌ Not OK' :
              item.status === 'NeedReplace' ? '⚠ Cần thay thế' :
              item.status;
            return (
              <Tag 
                key={item.checklistID}
                color={statusColor}
                style={{ 
                  marginBottom: 4, 
                  borderRadius: 12,
                  fontSize: '12px'
                }}
              >
                {item.itemName} ({statusText})
              </Tag>
            );
          })}
        </div>
      )
    },
    {
      title: "Tổng quan",
      key: "summary",
      width: 120,
      render: (_, record) => {
        const items = record.checklistItems || [];
        const okCount = items.filter(item => item.status === 'OK').length;
        const totalCount = items.length;
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#059669', fontWeight: 600 }}>{okCount}/{totalCount}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>OK</div>
          </div>
        );
      }
    },
    {
      title: "Ngày tạo",
      dataIndex: "createDate",
      key: "createDate",
      width: 150,
      render: (text) => new Date(text).toLocaleDateString('vi-VN')
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_: any, record: ServiceChecklistGroup) => (
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            style={{ color: '#2563eb' }}
          />
          {/* Individual item editing available in detail modal */}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)', padding: '24px' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        padding: '32px',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <FileTextOutlined style={{ fontSize: '36px', color: '#fff', marginRight: '16px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Service Checklist Của Tôi
          </h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <p style={{ color: '#e0f2fe', fontSize: '16px', margin: 0 }}>
            Xem và quản lý danh sách Service Checklist mà bạn đã tạo
          </p>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsCreateModalVisible(true);
              setCreateFormValid(false);
              form.resetFields();
              setSelectedCategories([]);
              setSelectedOrderCategories([]);
              setCategoryStatuses({});
            }}
            disabled={availableOrders.length === 0}
            style={{
              borderRadius: 10,
              background: availableOrders.length === 0 
                ? '#d1d5db' 
                : 'linear-gradient(90deg, #ffffff 0%, #f0f9ff 100%)',
              border: '2px solid #fff',
              color: availableOrders.length === 0 ? '#9ca3af' : '#0284c7',
              fontWeight: 700,
              height: 45
            }}
            title={availableOrders.length === 0 ? 'Không có Service Order nào chưa hoàn tất để tạo checklist' : ''}
          >
            Thêm Checklist
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card 
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}
        >
          <Statistic
            title={<span style={{ color: '#6b7280' }}>Tổng checklist</span>}
            value={checklists.length}
            prefix={<FileTextOutlined style={{ color: '#06b6d4' }} />}
            valueStyle={{ color: '#06b6d4', fontWeight: 700 }}
          />
        </Card>
        <Card style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <Statistic
            title={<span style={{ color: '#6b7280' }}>Trạng thái OK</span>}
            value={checklists.reduce((count, group) => 
              count + (group.checklistItems?.filter(item => item.status === 'OK').length || 0), 0
            )}
            prefix={<FileTextOutlined style={{ color: '#10b981' }} />}
            valueStyle={{ color: '#10b981', fontWeight: 700 }}
          />
        </Card>
        <Card style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <Statistic
            title={<span style={{ color: '#6b7280' }}>Cần thay thế</span>}
            value={checklists.reduce((count, group) => 
              count + (group.checklistItems?.filter(item => item.status === 'NeedReplace').length || 0), 0
            )}
            prefix={<FileTextOutlined style={{ color: '#f59e0b' }} />}
            valueStyle={{ color: '#f59e0b', fontWeight: 700 }}
          />
        </Card>
      </div>

      {/* Table Card */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <Input
            placeholder="Tìm kiếm theo khách hàng, xe, trung tâm, hạng mục..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '15px'
            }}
            size="large"
          />
        </div>

        {/* Table */}
        <Table
          dataSource={filteredChecklists}
          columns={columns}
          rowKey="checklistID"
          loading={loading}
          pagination={{ pageSize: 10, position: ['bottomCenter'] }}
          style={{ borderRadius: '12px' }}
          locale={{ emptyText: 'Bạn chưa tạo checklist nào' }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>
            📋 Chi tiết Service Checklist
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        centered
        width={600}
        styles={{ body: { borderRadius: '16px' } }}
      >
        {selectedChecklist && (
          <div>
            <Descriptions bordered column={1} style={{ marginTop: '16px' }}>
              <Descriptions.Item label="Order ID" labelStyle={{ fontWeight: 600 }}>
                #{selectedChecklist.orderID}
              </Descriptions.Item>
              <Descriptions.Item label="Appointment ID" labelStyle={{ fontWeight: 600 }}>
                #{selectedChecklist.appointmentID}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng" labelStyle={{ fontWeight: 600 }}>
                {selectedChecklist.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Xe" labelStyle={{ fontWeight: 600 }}>
                {selectedChecklist.vehicleModel}
              </Descriptions.Item>
              <Descriptions.Item label="Trung tâm" labelStyle={{ fontWeight: 600 }}>
                {selectedChecklist.centerName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" labelStyle={{ fontWeight: 600 }}>
                {new Date(selectedChecklist.createDate).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#1f2937' }}>
                Danh sách hạng mục kiểm tra ({selectedChecklist.checklistItems?.length || 0} mục)
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {selectedChecklist.checklistItems?.map((item) => {
                  const statusColor = 
                    item.status === 'OK' ? '#10b981' :
                    item.status === 'NotOK' ? '#ef4444' :
                    item.status === 'NeedReplace' ? '#f59e0b' : '#d1d5db';
                  const statusText = 
                    item.status === 'OK' ? '✓ OK' :
                    item.status === 'NotOK' ? '❌ Not OK' :
                    item.status === 'NeedReplace' ? '⚠ Cần thay thế' :
                    item.status;
                  return (
                    <Card 
                      key={item.checklistID}
                      size="small"
                      style={{ 
                        border: `1px solid ${statusColor}`,
                        borderRadius: '8px'
                      }}
                      extra={
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => openEditModal(item, selectedChecklist.orderID)}
                          style={{ color: '#06b6d4' }}
                        />
                      }
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1f2937' }}>
                            {item.itemName}
                          </div>
                          {item.notes && (
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                              {item.notes}
                            </div>
                          )}
                        </div>
                        <Tag 
                          color={
                            item.status === 'OK' ? 'green' :
                            item.status === 'NotOK' ? 'red' :
                            item.status === 'NeedReplace' ? 'orange' : 'default'
                          }
                          style={{ borderRadius: '8px', fontWeight: 600 }}
                        >
                          {statusText}
                        </Tag>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Checklist Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>
            ➕ Tạo Service Checklist Mới
          </div>
        }
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
          setCreateFormValid(false);
          setSelectedCategories([]);
          setSelectedOrderCategories([]);
          setCategoryStatuses({});
        }}
        onOk={() => form.submit()}
        okText="Tạo Checklist"
        cancelText="Hủy"
        okButtonProps={{
          disabled: !createFormValid,
          title: !createFormValid ? `Debug: Order: ${!!form.getFieldValue('orderID')}, Categories: ${(form.getFieldValue('categories') || []).length}, Status: ${!!form.getFieldValue('status')}, Valid: ${createFormValid}` : '',
          style: {
            borderRadius: 8,
            background: createFormValid 
              ? 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)'
              : '#d1d5db',
            border: 'none',
            fontWeight: 600,
            height: 40,
            cursor: createFormValid ? 'pointer' : 'not-allowed',
            opacity: createFormValid ? 1 : 0.6
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: 8,
            fontWeight: 600,
            height: 40
          }
        }}
        width={600}
        styles={{ body: { borderRadius: '16px' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateChecklist}
          onValuesChange={() => {
            // Validate form khi có thay đổi
            const values = form.getFieldsValue();
            
            // Kiểm tra basic validation - đơn giản hóa
            const hasOrder = !!values.orderID;
            const hasCategories = values.categories && values.categories.length > 0;
            const hasStatus = !!values.status;
            
            // Chỉ cần 3 điều kiện cơ bản
            const isValid = hasOrder && hasCategories && hasStatus;
            
            console.log('SIMPLE validation:', {
              hasOrder,
              hasCategories,
              hasStatus,
              isValid,
              orderID: values.orderID,
              categories: values.categories,
              status: values.status
            });
            
            setCreateFormValid(isValid);
          }}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Order ID</span>}
            name="orderID"
            rules={[
              { required: true, message: "Vui lòng chọn Order ID" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const selectedOrder = serviceOrders.find(
                    order => (order.OrderID || order.orderID) === value
                  );
                  if (selectedOrder && selectedOrder.status === 'Completed') {
                    return Promise.reject(new Error('Không thể chọn Service Order đã hoàn tất!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Select
              placeholder="Chọn Order ID"
              size="large"
              style={{ borderRadius: 10 }}
              loading={loadingOrders}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                // Validate ngay khi chọn
                const selectedOrder = serviceOrders.find(
                  order => (order.OrderID || order.orderID) === value
                );
                if (selectedOrder && selectedOrder.status === 'Completed') {
                  message.error('Không thể chọn Service Order đã hoàn tất!');
                  form.setFieldsValue({ orderID: undefined });
                  form.setFields([{ name: 'orderID', errors: ['Không thể chọn Service Order đã hoàn tất'] }]);
                } else if (value) {
                  // Load categories từ order
                  loadCategoriesFromOrder(value);
                }
              }}
              options={availableOrders.map(order => {
                // Double check: không bao giờ hiển thị order completed
                if (order.status === 'Completed') {
                  console.error('ERROR: Completed order found in availableOrders:', order.OrderID || order.orderID);
                }
                return {
                  value: order.OrderID || order.orderID,
                  label: `Order #${order.OrderID || order.orderID} - ${order.customerName} - ${order.vehicleModel} (${order.status})`,
                  disabled: order.status === 'Completed'
                };
              })}
            />
          </Form.Item>

          {/* Categories từ Service Package */}
          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Hạng mục kiểm tra (tự động chọn tất cả)</span>}
            name="categories"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất một danh mục" }]}
          >
            {selectedOrderCategories.length > 0 ? (
              <div style={{ 
                border: '1px solid #d1d5db', 
                borderRadius: 10, 
                padding: 16,
                maxHeight: 400,
                overflowY: 'auto'
              }}>
                <div style={{ marginBottom: 16, fontWeight: 600, color: '#1f2937' }}>
                  Tất cả hạng mục được chọn mặc định ({selectedOrderCategories.length} hạng mục)
                </div>
                
                <div style={{ display: 'grid', gap: 16 }}>
                  {selectedOrderCategories.map(category => {
                    return (
                      <div 
                        key={category.categoryID}
                        style={{
                          border: '2px solid #06b6d4',
                          borderRadius: 12,
                          padding: 16,
                          background: '#f0f9ff'
                        }}
                      >
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 600, fontSize: 16, color: '#1f2937' }}>
                            ✓ {category.name}
                          </div>
                          <div style={{ 
                            color: '#6b7280', 
                            fontSize: 14,
                            marginTop: 4 
                          }}>
                            {category.description}
                          </div>
                        </div>
                        
                        <div style={{ 
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: '1px solid #e5e7eb'
                        }}>
                          <div style={{ width: '200px' }}>
                            <label style={{ 
                              display: 'block', 
                              fontSize: 12, 
                              fontWeight: 600,
                              color: '#374151',
                              marginBottom: 4
                            }}>
                              Trạng thái
                            </label>
                            <Select
                              value={categoryStatuses[category.categoryID] || 'OK'}
                              onChange={(value) => {
                                setCategoryStatuses(prev => ({
                                  ...prev,
                                  [category.categoryID]: value
                                }));
                              }}
                              size="small"
                              style={{ width: '100%' }}
                              options={[
                                { value: 'OK', label: '✓ OK' },
                                { value: 'NotOK', label: '❌ Not OK' },
                                { value: 'NeedReplace', label: '⚠ Cần thay thế' }
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                padding: 20,
                border: '1px dashed #d1d5db',
                borderRadius: 10
              }}>
                {loadingCategories ? 'Đang tải danh mục...' : 'Vui lòng chọn Order ID trước để xem các danh mục kiểm tra'}
              </div>
            )}
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Trạng thái mặc định</span>}
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái mặc định" }]}
          >
            <Select
              placeholder="Chọn trạng thái mặc định cho tất cả hạng mục"
              size="large"
              style={{ borderRadius: 10 }}
            >
              <Select.Option value="OK">✓ OK</Select.Option>
              <Select.Option value="NotOK">❌ Not OK</Select.Option>
              <Select.Option value="NeedReplace">⚠ Cần thay thế</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Ghi chú chung</span>}
            name="notes"
          >
            <Input.TextArea
              placeholder="Nhập ghi chú chung cho tất cả các hạng mục..."
              rows={3}
              style={{ borderRadius: 10 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Checklist Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>
            ✏️ Chỉnh sửa Service Checklist
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingChecklist(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
        okButtonProps={{
          style: {
            borderRadius: 8,
            background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)',
            border: 'none',
            fontWeight: 600,
            height: 40
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: 8,
            fontWeight: 600,
            height: 40
          }
        }}
        width={600}
        styles={{ body: { borderRadius: '16px' } }}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditChecklist}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Order ID</span>}
            name="orderID"
            rules={[{ required: true, message: "Vui lòng chọn Order ID" }]}
          >
            <Select
              placeholder="Chọn Order ID"
              size="large"
              style={{ borderRadius: 10 }}
              loading={loadingOrders}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={getEditModalOrders().map(order => ({
                value: order.OrderID || order.orderID,
                label: `Order #${order.OrderID || order.orderID} - ${order.customerName} - ${order.vehicleModel} (${order.status})${order.status === 'Completed' ? ' - Đã hoàn tất' : ''}`
              }))}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Tên hạng mục</span>}
            name="itemName"
            rules={[{ required: true, message: "Vui lòng nhập tên hạng mục" }]}
          >
            <Input
              placeholder="Ví dụ: Kiểm tra pin, Kiểm tra hệ thống điện..."
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Trạng thái</span>}
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select
              placeholder="Chọn trạng thái"
              size="large"
              style={{ borderRadius: 10 }}
            >
              <Select.Option value="OK">✓ OK</Select.Option>
              <Select.Option value="NotOK">❌ Not OK</Select.Option>
              <Select.Option value="NeedReplace">⚠ Cần thay thế</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Ghi chú</span>}
            name="notes"
          >
            <Input.TextArea
              placeholder="Nhập ghi chú (nếu có)"
              rows={4}
              style={{ borderRadius: 10 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TechnicianChecklistView;

