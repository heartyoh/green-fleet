update 
	driver d,
	(
		select 
			driver, 
			(effcc_sum/cnt) avg_effcc,
			(eco_sum/cnt) eco_index, 
			((eco_time_sum/runtime_sum) * 100) eco_run_rate
		from (
			select 
				driver, 
				count(driver) cnt, 
				sum(effcc) effcc_sum, 
				sum(eco_index) eco_sum,
				sum(eco_drv_time) eco_time_sum,
				sum(run_time) runtime_sum						
			from 
				driver_run_sum 
			where 
				company = :company and 
				month_date >= :fromDate and 
				month_date <= :toDate 
			group by driver
		) ds
	) s	
set
	d.avg_effcc = s.avg_effcc,
	d.eco_index = s.eco_index,
	d.eco_run_rate = s.eco_run_rate
where
	d.id = s.driver and d.company = :company