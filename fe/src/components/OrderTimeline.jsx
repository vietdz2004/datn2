import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineConnector,
  TimelineDot,
  TimelineContent
} from '@mui/lab';
import { Typography } from '@mui/material';
import {
  Schedule,
  CheckCircle,
  LocalShipping,
  Error
} from '@mui/icons-material';

const OrderTimeline = ({ status }) => {
  const steps = [
    {
      label: 'Chờ xử lý',
      description: 'Đơn hàng mới được tạo',
      icon: <Schedule />,
      step: 1
    },
    {
      label: 'Đã xác nhận',
      description: 'Shop đã xác nhận đơn hàng',
      icon: <CheckCircle />,
      step: 2
    },
    {
      label: 'Đang chuẩn bị',
      description: 'Đang đóng gói sản phẩm',
      icon: <LocalShipping />,
      step: 3
    },
    {
      label: 'Đang giao',
      description: 'Đã bàn giao cho đơn vị vận chuyển',
      icon: <LocalShipping />,
      step: 4
    },
    {
      label: 'Đã giao',
      description: 'Giao hàng thành công',
      icon: <CheckCircle />,
      step: 5
    }
  ];

  // Get current step based on status
  const getCurrentStep = (status) => {
    const statusSteps = {
      'cho_xu_ly': 1,
      'da_xac_nhan': 2,
      'dang_chuan_bi': 3,
      'dang_giao': 4,
      'da_giao': 5,
      'huy_boi_khach': -1,
      'huy_boi_admin': -1,
      'khach_bom_hang': -1
    };
    return statusSteps[status] || 0;
  };

  const currentStep = getCurrentStep(status);

  // If order is cancelled or failed
  if (currentStep === -1) {
    return (
      <Timeline position="alternate">
        <TimelineItem>
          <TimelineOppositeContent color="error">
            {status === 'huy_boi_khach' && 'Đã hủy theo yêu cầu'}
            {status === 'huy_boi_admin' && 'Đã hủy bởi cửa hàng'}
            {status === 'khach_bom_hang' && 'Giao hàng không thành công'}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="error">
              <Error />
            </TimelineDot>
          </TimelineSeparator>
          <TimelineContent>
            <Typography color="error">Đơn hàng đã hủy</Typography>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    );
  }

  return (
    <Timeline position="alternate">
      {steps.map((step, index) => (
        <TimelineItem key={index}>
          <TimelineOppositeContent color="text.secondary">
            {step.description}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot
              color={
                currentStep > step.step
                  ? 'success'
                  : currentStep === step.step
                  ? 'primary'
                  : 'grey'
              }
            >
              {step.icon}
            </TimelineDot>
            {index < steps.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography
              color={
                currentStep > step.step
                  ? 'success.main'
                  : currentStep === step.step
                  ? 'primary.main'
                  : 'text.secondary'
              }
            >
              {step.label}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default OrderTimeline;
