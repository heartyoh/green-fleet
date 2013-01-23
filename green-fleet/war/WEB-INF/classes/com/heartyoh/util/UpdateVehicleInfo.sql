update 
	vehicle v,
	(
		select 
			vehicle, 
			(effcc_sum/cnt) avg_effcc,
			(eco_sum/cnt) eco_index, 
			((eco_time_sum/runtime_sum) * 100) eco_run_rate
		from (
			select 
				vehicle, 
				count(vehicle) cnt, 
				sum(effcc) effcc_sum, 
				sum(eco_index) eco_sum,
				sum(eco_drv_time) eco_time_sum,
				sum(run_time) runtime_sum						
			from 
				vehicle_run_sum 
			where 
				company = :company and 
				month_date >= :fromDate and 
				month_date <= :toDate 
			group by vehicle
		) vs
	) s	
set
	v.avg_effcc = s.avg_effcc,
	v.eco_index = s.eco_index,
	v.eco_run_rate = s.eco_run_rate
where
	v.id = s.vehicle and v.company = :company